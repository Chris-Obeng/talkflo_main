/**
 * Standard client-side hook for notes list management without Realtime
 */

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Note } from '@/lib/types'

interface UseNotesOptions {
  search?: string
  tags?: string[]
  limit?: number
  offset?: number
  enabled?: boolean
}

export function useNotes(options: UseNotesOptions = {}) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { search, tags, limit, offset, enabled = true } = options
  const supabase = createClient()

  // Fetch notes from database
  const fetchNotes = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
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
        .order('created_at', { ascending: false })

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,processed_content.ilike.%${search}%,original_transcript.ilike.%${search}%`)
      }

      if (limit) {
        query = query.limit(limit)
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching notes:', error)
        setError(error.message)
        return
      }

      // Transform the data to match our Note type
      const notesData: Note[] = (data || []).map((note: any) => ({
        ...note,
        tags: note.note_tags?.map((nt: any) => nt.tags) || []
      }))

      // Filter by tags if specified (client-side filtering for tag names)
      let filteredNotes = notesData
      if (tags && tags.length > 0) {
        filteredNotes = notesData.filter(note => 
          note.tags?.some(tag => tags.includes(tag.name))
        )
      }

      setNotes(filteredNotes)
    } catch (err) {
      console.error('Error fetching notes:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notes')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, search, tags, limit, offset, enabled])

  // Fetch initial data
  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // Manually add a new note to the state (for optimistic updates)
  const addNote = useCallback((newNote: Note) => {
    setNotes(currentNotes => [newNote, ...currentNotes])
  }, [])

  // Manually update a note in the state
  const updateNote = useCallback((noteId: string, updatedNote: Partial<Note>) => {
    setNotes(currentNotes => 
      currentNotes.map(note => 
        note.id === noteId ? { ...note, ...updatedNote } : note
      )
    )
  }, [])

  // Manually remove a note from the state
  const removeNote = useCallback((noteId: string) => {
    setNotes(currentNotes => 
      currentNotes.filter(note => note.id !== noteId)
    )
  }, [])

  return {
    notes,
    isLoading,
    error,
    refetch: fetchNotes,
    addNote,
    updateNote,
    removeNote
  }
}