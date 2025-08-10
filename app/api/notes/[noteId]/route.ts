import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { NoteTag, UITag } from '@/lib/types';

interface NoteTagWithTag extends NoteTag {
  tags: UITag;
}
 
 // GET /api/notes/[noteId] - Fetch single note with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params
    const supabase = await createClient()
    
    // Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch note with tags
    const { data: note, error: noteError } = await supabase
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
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single()

    if (noteError || !note) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      )
    }

    // Format the response
    const formattedNote = {
      ...note,
      tags: note.note_tags?.map((nt: NoteTagWithTag) => nt.tags).filter(Boolean) || []
    }
    delete (formattedNote as { note_tags?: NoteTagWithTag[] }).note_tags

    return NextResponse.json({
      success: true,
      note: formattedNote
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/notes/[noteId] - Update note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params
    const supabase = await createClient()
    
    // Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { title, processed_content } = body

    // Validate input
    if (!title && !processed_content) {
      return NextResponse.json(
        { error: 'At least one field (title, processed_content) must be provided' },
        { status: 400 }
      )
    }

    // Verify note ownership
    const { data: existingNote, error: checkError } = await supabase
      .from('notes')
      .select('id')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingNote) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: {
      title?: string;
      processed_content?: string;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (processed_content !== undefined) updateData.processed_content = processed_content

    // Update note
    const { data: updatedNote, error: updateError } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId)
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
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      )
    }

    // Format the response
    const formattedNote = {
      ...updatedNote,
      tags: updatedNote.note_tags?.map((nt: NoteTagWithTag) => nt.tags).filter(Boolean) || []
    }
    delete (formattedNote as { note_tags?: NoteTagWithTag[] }).note_tags

    return NextResponse.json({
      success: true,
      message: 'Note updated successfully',
      note: formattedNote
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/notes/[noteId] - Delete note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params
    const supabase = await createClient()
    
    // Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch note to get audio URL and verify ownership
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('audio_url')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single()

    if (noteError || !note) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      )
    }

    // Delete audio file from storage if it exists
    if (note.audio_url) {
      try {
        // Extract file path from URL
        const urlParts = note.audio_url.split('/')
        const fileName = urlParts.slice(-2).join('/') // user_id/filename
        
        await supabase.storage
          .from('audio-files')
          .remove([fileName])
      } catch (storageError) {
        console.error('Error deleting audio file:', storageError)
        // Continue with note deletion even if file deletion fails
      }
    }

    // Delete note (cascade will handle note_tags)
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete note' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}