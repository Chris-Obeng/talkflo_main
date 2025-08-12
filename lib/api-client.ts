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
      // Check if operation was aborted before starting
      if (abortSignal?.aborted) {
        throw new Error('Upload canceled')
      }

      console.log('🔐 Checking authentication...');
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError || !user) {
        console.error('🔐 Authentication failed:', authError);
        throw new Error('Not authenticated')
      }
      console.log('🔐 User authenticated:', user.id);

      // Derive a safe file extension based on blob type
      const fileExtension = audioBlob.type.includes('webm') ? '.webm' : 
                           audioBlob.type.includes('mp4') ? '.mp4' : 
                           audioBlob.type.includes('wav') ? '.wav' : 
                           audioBlob.type.includes('m4a') ? '.m4a' : 
                           audioBlob.type.includes('aac') ? '.aac' : '.webm'
      // Normalize file name (currently unused, kept for future metadata; avoid lint error)
      void fileName.replace(/\.[^/.]+$/, '')

      // Generate storage path: userId/timestamp-random.ext
      const randomSuffix = Math.random().toString(36).substring(7)
      const storagePath = `${user.id}/${Date.now()}-${randomSuffix}${fileExtension}`

      // Check if operation was aborted before upload
      if (abortSignal?.aborted) {
        throw new Error('Upload canceled')
      }

      // Start progress
      onProgress?.(0)
      console.log('📤 Uploading directly to Supabase Storage:', storagePath, 'type:', audioBlob.type, 'size:', audioBlob.size)

      // Upload directly to Supabase Storage to avoid serverless body limits
      const { data: uploadData, error: uploadError } = await this.supabase
        .storage
        .from('audio-files')
        .upload(storagePath, audioBlob, {
          contentType: audioBlob.type || 'application/octet-stream',
          upsert: false
        })

      if (uploadError) {
        console.error('📤 Storage upload error:', uploadError)
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }

      console.log('📤 File uploaded to storage at:', uploadData?.path)
      
      // Check if operation was aborted after upload
      if (abortSignal?.aborted) {
        // Clean up uploaded file if operation was aborted
        await this.supabase.storage.from('audio-files').remove([storagePath])
        throw new Error('Upload canceled')
      }
      
      // Update progress to near-complete; DB ops follow
      onProgress?.(90)

      // Get public URL for the uploaded file
      const { data: publicUrlData } = this.supabase
        .storage
        .from('audio-files')
        .getPublicUrl(storagePath)

      const publicUrl = publicUrlData.publicUrl

      // Create or update note record
      let noteId: string | undefined

      if (appendToNoteId) {
        console.log('🗒️ Appending uploaded audio to existing note:', appendToNoteId)
        const { data: updatedNote, error: updateError } = await this.supabase
          .from('notes')
          .update({
            audio_url: publicUrl,
            audio_duration: null,
            status: 'processing'
          })
          .eq('id', appendToNoteId)
          .eq('user_id', user.id)
          .select('*')
          .single()

        if (updateError || !updatedNote) {
          console.error('🗒️ Failed to update note with new audio:', updateError)
          // Best-effort cleanup of the uploaded file
          await this.supabase.storage.from('audio-files').remove([storagePath])
          throw new Error(updateError?.message || 'Note not found or access denied')
        }

        noteId = updatedNote.id
      } else {
        console.log('🗒️ Creating new note for uploaded audio')
        const { data: newNote, error: insertError } = await this.supabase
          .from('notes')
          .insert({
            user_id: user.id,
            title: 'Processing…',
            audio_url: publicUrl,
            audio_duration: null,
            status: 'processing'
          })
          .select('*')
          .single()

        if (insertError || !newNote) {
          console.error('🗒️ Failed to create note for uploaded audio:', insertError)
          await this.supabase.storage.from('audio-files').remove([storagePath])
          throw new Error(insertError?.message || 'Database error')
        }

        noteId = newNote.id
      }

      // Trigger processing via webhook handler (does not require large payload)
      try {
        const webhookUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/webhook-handler`
        fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY}`
          },
          body: JSON.stringify({
            type: 'audio_uploaded',
            data: {
              noteId,
              userId: user.id,
              isAppend: !!appendToNoteId
            }
          })
        }).catch((err) => {
          console.error('Failed to trigger processing webhook:', err)
        })
      } catch (err) {
        console.error('Error triggering webhook:', err)
      }

      onProgress?.(100)
      return { success: true, noteId }

    } catch (error) {
      console.error('📤 Upload error:', error)

      if (error instanceof Error && (error.name === 'AbortError' || error.message === 'Upload canceled')) {
        return { success: false, error: 'Upload canceled' }
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
   * Clean up audio file after successful processing
   */
  async cleanupAudioFile(noteId: string): Promise<boolean> {
    try {
      console.log('🗑️ Cleaning up audio file for note:', noteId);
      
      const response = await fetch(`/api/notes/${noteId}/cleanup-audio`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        console.warn('🗑️ Audio cleanup failed:', response.status, response.statusText);
        return false;
      }

      console.log('🗑️ Audio file cleanup successful');
      return true;
    } catch (error) {
      console.error('🗑️ Error during audio cleanup:', error);
      return false;
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
          
          // Clean up audio file if processing completed successfully
          if (note.status === 'completed' && note.audio_url) {
            this.cleanupAudioFile(noteId).catch(error => {
              console.warn('🗑️ Audio cleanup failed (non-critical):', error);
            });
          }
          
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