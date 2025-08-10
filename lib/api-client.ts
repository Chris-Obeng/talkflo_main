/**
 * API client for TalkFlo backend
 */

import { createClient } from '@/lib/supabase/client'
import { Note, Tag } from './types'

export class ApiClient {
  private supabase = createClient()

  /**
   * Upload audio file and create note or append to existing note
   */
  async uploadAudio(
    audioBlob: Blob, 
    fileName: string = 'recording.wav', 
    appendToNoteId?: string, 
    abortSignal?: AbortSignal,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; noteId?: string; error?: string }> {
    try {
      console.log('🔐 Checking authentication...');
      // Get current user
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError || !user) {
        console.error('🔐 Authentication failed:', authError);
        throw new Error('Not authenticated')
      }
      console.log('🔐 User authenticated:', user.id);

      // Create FormData for file upload with proper file extension
      const fileExtension = audioBlob.type.includes('webm') ? '.webm' : 
                           audioBlob.type.includes('mp4') ? '.mp4' : 
                           audioBlob.type.includes('wav') ? '.wav' : '.webm'
      const properFileName = fileName.replace(/\.[^/.]+$/, '') + fileExtension
      
      const formData = new FormData()
      formData.append('audio', audioBlob, properFileName)
      if (appendToNoteId) {
        formData.append('appendToNoteId', appendToNoteId)
        console.log('📦 Adding appendToNoteId to form data:', appendToNoteId);
      }
      console.log('📦 Created form data with audio blob:', audioBlob.size, 'bytes, type:', audioBlob.type, 'filename:', properFileName, appendToNoteId ? `appending to note: ${appendToNoteId}` : 'creating new note');

      // Use XMLHttpRequest for real upload progress tracking
      console.log('📤 Sending upload request to /api/upload-audio...');
      
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Handle abort signal
        if (abortSignal) {
          abortSignal.addEventListener('abort', () => {
            xhr.abort();
          });
        }
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            console.log('📤 Upload progress:', progress + '%');
            onProgress(progress);
          }
        });
        
        // Handle completion
        xhr.addEventListener('load', () => {
          console.log('📤 Upload response status:', xhr.status);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log('📤 Upload success:', data);
              
              if (!data.noteId) {
                reject(new Error('API did not return a noteId'));
                return;
              }
              
              resolve({
                success: true,
                noteId: data.noteId
              });
            } catch (parseError) {
              console.error('📤 Failed to parse response:', parseError);
              reject(new Error('Invalid response from server'));
            }
          } else {
            let errorDetails;
            try {
              const errorText = xhr.responseText;
              console.error('📤 Raw error response:', errorText);
              
              // Try to parse as JSON
              try {
                errorDetails = JSON.parse(errorText);
              } catch {
                errorDetails = { error: errorText || `HTTP ${xhr.status}: ${xhr.statusText}` };
              }
            } catch (readError) {
              console.error('📤 Failed to read error response:', readError);
              errorDetails = { error: `HTTP ${xhr.status}: ${xhr.statusText}` };
            }
            
            console.error('📤 Upload API error:', errorDetails);
            reject(new Error(errorDetails.error || `Upload failed with status ${xhr.status}`));
          }
        });
        
        // Handle network errors
        xhr.addEventListener('error', () => {
          console.error('📤 Upload network error');
          reject(new Error('Network error during upload'));
        });
        
        // Handle abort
        xhr.addEventListener('abort', () => {
          console.log('📤 Upload aborted');
          reject(new Error('Upload canceled'));
        });
        
        // Configure and send request
        xhr.open('POST', '/api/upload-audio');
        xhr.withCredentials = true; // Include cookies for authentication
        xhr.send(formData);
      });
      
    } catch (error) {
      console.error('📤 Upload error:', error)
      
      // Handle abort error specifically
      if (error instanceof Error && (error.name === 'AbortError' || error.message === 'Upload canceled')) {
        return {
          success: false,
          error: 'Upload canceled'
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  /**
   * Rewrite a note using custom instructions
   */
  async rewriteNote(noteId: string, instructions: string): Promise<{ success: boolean; note?: Note; error?: string }> {
    try {
      const response = await fetch(`/api/notes/${noteId}/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructions }),
        credentials: 'include'
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        return { success: false, error: data?.error || 'Rewrite failed' }
      }

      return { success: true, note: data.note }
    } catch (error) {
      console.error('Error rewriting note:', error)
      return { success: false, error: 'Rewrite failed' }
    }
  }

  /**
   * Get all notes for current user
   */
  async getNotes(options?: {
    search?: string
    tags?: string[]
    limit?: number
    offset?: number
  }): Promise<Note[]> {
    try {
      const params = new URLSearchParams()
      if (options?.search) params.append('search', options.search)
      if (options?.tags?.length) params.append('tags', options.tags.join(','))
      if (options?.limit) params.append('limit', options.limit.toString())
      if (options?.offset) params.append('offset', options.offset.toString())

      const response = await fetch(`/api/notes?${params.toString()}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }

      const data = await response.json()
      return data.notes || []
    } catch (error) {
      console.error('Error fetching notes:', error)
      return []
    }
  }

  /**
   * Get single note by ID
   */
  async getNote(id: string): Promise<Note | null> {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch note')
      }

      const data = await response.json()
      return data.note || null
    } catch (error) {
      console.error('Error fetching note:', error)
      return null
    }
  }

  /**
   * Update note
   */
  async updateNote(id: string, updates: { title?: string; processed_content?: string }): Promise<boolean> {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates),
        credentials: 'include'
      })

      return response.ok
    } catch (error) {
      console.error('Error updating note:', error)
      return false
    }
  }

  /**
   * Delete note
   */
  async deleteNote(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting note:', error)
      return false
    }
  }

  /**
   * Get all tags for current user
   */
  async getTags(): Promise<Tag[]> {
    try {
      const response = await fetch('/api/tags', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }

      const data = await response.json()
      return data.tags || []
    } catch (error) {
      console.error('Error fetching tags:', error)
      return []
    }
  }

  /**
   * Create new tag
   */
  async createTag(name: string, color?: string): Promise<Tag | null> {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, color }),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to create tag')
      }

      const data = await response.json()
      return data.tag || null
    } catch (error) {
      console.error('Error creating tag:', error)
      return null
    }
  }

  /**
   * Add tags to note
   */
  async addTagsToNote(noteId: string, tagIds: string[]): Promise<boolean> {
    try {
      const response = await fetch(`/api/notes/${noteId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tagIds }),
        credentials: 'include'
      })

      return response.ok
    } catch (error) {
      console.error('Error adding tags to note:', error)
      return false
    }
  }

  /**
   * Remove tag from note
   */
  async removeTagFromNote(noteId: string, tagId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/notes/${noteId}/tags/${tagId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      return response.ok
    } catch (error) {
      console.error('Error removing tag from note:', error)
      return false
    }
  }

  /**
   * Poll for note updates (for real-time processing status)
   * Simplified to avoid recursive API calls
   */
  async pollNoteStatus(noteId: string, onUpdate: (note: Note) => void): Promise<void> {
    const maxAttempts = 30 // 5 minutes with 10s intervals
    let attempts = 0
    let consecutiveErrors = 0
    
    console.log('🔄 Starting polling for note:', noteId);

    const poll = async () => {
      try {
        console.log(`🔄 Polling attempt ${attempts + 1}/${maxAttempts} for note:`, noteId);
        
        // Simply get the note - no process-audio endpoint calls
        const note = await this.getNote(noteId)
        if (!note) {
          console.warn('🔄 Note not found during polling:', noteId);
          consecutiveErrors++
          
          // If we can't find the note after several attempts, stop polling
          if (consecutiveErrors >= 3) {
            console.error('🔄 Note not found after multiple attempts, stopping polling');
            return
          }
          
          // Retry in a shorter interval
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000) // Retry in 5 seconds
          }
          return
        }

        // Reset error counter on successful fetch
        consecutiveErrors = 0

        console.log('🔄 Polling result:', note.status, note.title);
        onUpdate(note)

        // Stop polling if completed or failed
        if (note.status === 'completed' || note.status === 'failed') {
          console.log('🔄 Polling stopped, final status:', note.status);
          return
        }

        // Check if note has been processing too long and apply timeout
        const processingTime = Date.now() - new Date(note.created_at).getTime()
        const fiveMinutes = 5 * 60 * 1000

        if (note.status === 'processing' && processingTime > fiveMinutes) {
          console.warn('🔄 Note has been processing for too long, will rely on real-time updates or manual refresh');
          // Let the real-time subscription handle timeouts via the GET endpoint
          return
        }

        // Continue polling if still processing
        attempts++
        if (attempts < maxAttempts) {
          console.log(`🔄 Scheduling next poll in 10 seconds... (${attempts}/${maxAttempts})`);
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else {
          console.warn('🔄 Polling timed out after', maxAttempts, 'attempts');
          console.log('🔄 Relying on real-time updates for further changes');
        }
      } catch (error) {
        console.error('🔄 Error polling note status:', error)
        consecutiveErrors++
        
        // If we have too many consecutive errors, stop polling
        if (consecutiveErrors >= 5) {
          console.error('🔄 Too many consecutive errors, stopping polling');
          return
        }
        
        // Continue polling despite errors (could be temporary network issues)
        attempts++
        if (attempts < maxAttempts) {
          console.log(`🔄 Retrying poll in 10 seconds after error... (${attempts}/${maxAttempts})`);
          setTimeout(poll, 10000)
        }
      }
    }

    // Start polling
    console.log('🔄 Starting first poll in 5 seconds...');
    setTimeout(poll, 5000) // Start after 5 seconds
  }
}

// Export singleton instance
export const apiClient = new ApiClient()