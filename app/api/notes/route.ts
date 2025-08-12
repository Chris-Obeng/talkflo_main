import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { NoteTag, UITag } from '@/lib/types';

interface NoteTagWithTag extends NoteTag {
  tags: UITag;
}
 
 // GET /api/notes - Fetch notes with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const tags = searchParams.get('tags')?.split(',') || []
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') || 'all'

    // Build base query
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply search filter (search in title and processed_content)
    if (search) {
      query = query.or(`title.ilike.%${search}%,processed_content.ilike.%${search}%`)
    }

    const { data: notes, error: notesError } = await query

    if (notesError) {
      console.error('Database error:', notesError)
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      )
    }

    // Filter by tags if specified
    let filteredNotes = notes
    if (tags.length > 0) {
      filteredNotes = notes.filter(note => {
        const noteTags = note.note_tags?.map((nt: NoteTagWithTag) => nt.tags?.name) || []
        return tags.some(tag => noteTags.includes(tag))
      })
    }

    // Format the response
    const formattedNotes = filteredNotes.map(note => ({
      ...note,
      tags: note.note_tags?.map((nt: NoteTagWithTag) => nt.tags).filter(Boolean) || []
    }))

    // Remove the note_tags property as we've flattened it to tags
    formattedNotes.forEach(note => {
      delete (note as { note_tags?: NoteTagWithTag[] }).note_tags
    })

    // Get total count for pagination
    const { count } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      notes: formattedNotes,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}