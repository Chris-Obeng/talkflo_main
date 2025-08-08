import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE /api/notes/[noteId]/tags/[tagId] - Remove tag from note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string, tagId: string }> }
) {
  try {
    const { noteId, tagId } = await params
    const supabase = await createClient()
    
    // Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify note ownership
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('id')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single()

    if (noteError || !note) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      )
    }

    // Verify tag ownership
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('id', tagId)
      .eq('user_id', user.id)
      .single()

    if (tagError || !tag) {
      return NextResponse.json(
        { error: 'Tag not found or access denied' },
        { status: 404 }
      )
    }

    // Check if the relationship exists
    const { data: relationship, error: relationshipError } = await supabase
      .from('note_tags')
      .select('id')
      .eq('note_id', noteId)
      .eq('tag_id', tagId)
      .single()

    if (relationshipError || !relationship) {
      return NextResponse.json(
        { error: 'Tag is not associated with this note' },
        { status: 404 }
      )
    }

    // Delete the note-tag relationship
    const { error: deleteError } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)
      .eq('tag_id', tagId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove tag from note' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tag removed from note successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}