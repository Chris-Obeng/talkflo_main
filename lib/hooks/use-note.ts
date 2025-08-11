/**
 * Standard client-side hook for single note management without Realtime
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Note, NoteTag, UITag } from '@/lib/types'

interface NoteTagWithTag extends NoteTag {
  tags: UITag;
}

interface UseNoteOptions {
  noteId: string | null
  onUpdate?: (note: Note) => void
  enabled?: boolean
}

export function useNote({ noteId, onUpdate, enabled = true }: UseNoteOptions) {
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  // Fetch note data
  const fetchNote = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          note_tags (
            tag_id,
            tags (
              id,
              name,
              color
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching note:', error)
        setError(error.message)
        return
      }

      // Transform the data to match our Note type
      const noteData: Note = {
        ...data,
        tags: data.note_tags?.map((nt: NoteTagWithTag) => nt.tags) || []
      }

      setNote(noteData)
      onUpdate?.(noteData)
    } catch (err) {
      console.error('Error fetching note:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch note')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, onUpdate])

  useEffect(() => {
    if (!noteId || !enabled) {
      setNote(null)
      return
    }

    fetchNote(noteId)
  }, [noteId, enabled, fetchNote])

  return {
    note,
    isLoading,
    error,
    refetch: noteId ? () => fetchNote(noteId) : undefined
  }
}

/**
 * Hook for monitoring a specific note's processing status without Realtime
 * Uses polling for processing notes
 */
export function useNoteProcessingStatus(noteId: string | null) {
  const [processingNote, setProcessingNote] = useState<Note | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  const handleNoteUpdate = useCallback((note: Note) => {
    setProcessingNote(note)
    
    if (note.status === 'completed') {
      setIsCompleted(true)
      setHasFailed(false)
    } else if (note.status === 'failed') {
      setHasFailed(true)
      setIsCompleted(false)
    } else {
      setIsCompleted(false)
      setHasFailed(false)
    }
  }, [])

  // Memoize the options object to prevent infinite re-renders
  const noteOptions = useMemo(() => ({
    noteId,
    onUpdate: handleNoteUpdate,
    enabled: !!noteId
  }), [noteId, handleNoteUpdate])

  // Use the standard note hook with polling for processing notes
  const { note, isLoading, error, refetch } = useNote(noteOptions)

  // Poll for updates while note is processing
  useEffect(() => {
    if (!noteId || !note || note.status === 'completed' || note.status === 'failed' || !refetch) {
      return
    }

    // Only poll if note is in processing or pending state
    if (note.status !== 'processing' && note.status !== 'pending') {
      return
    }

    let pollCount = 0
    const maxPolls = 60 // 2 minutes at 2-second intervals

    const pollInterval = setInterval(async () => {
      pollCount++
      
      // Double-check status before refetching to prevent unnecessary calls
      if (note.status === 'processing' || note.status === 'pending') {
        console.log('🔄 Polling for note updates:', noteId, 'status:', note.status, `(${pollCount}/${maxPolls})`)
        
        // After 2 minutes of processing, trigger fallback
        if (pollCount >= maxPolls) {
          console.log('⏰ Processing timeout reached, triggering fallback...')
          try {
            const response = await fetch(`/api/process-audio/${noteId}`, {
              method: 'GET',
              credentials: 'include'
            })
            
            if (response.ok) {
              const result = await response.json()
              if (result.action === 'fallback_applied') {
                console.log('✅ Fallback processing applied')
              }
            }
          } catch (error) {
            console.error('Failed to trigger fallback processing:', error)
          }
        }
        
        refetch()
      }
    }, 2000) // Poll every 2 seconds

    return () => {
      console.log('🛑 Stopping polling for note:', noteId)
      clearInterval(pollInterval)
    }
  }, [noteId, note, refetch])

  // Reset state when noteId changes
  useEffect(() => {
    if (!noteId) {
      setProcessingNote(null)
      setIsCompleted(false)
      setHasFailed(false)
    }
  }, [noteId])

  return {
    note: processingNote || note,
    isLoading,
    error,
    isCompleted,
    hasFailed,
    isProcessing: note?.status === 'processing'
  }
}