import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/notes/[noteId]/tags - Add tags to note
export async function POST(
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
    const { tagIds } = body

    // Validate input
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return NextResponse.json(
        { error: 'tagIds must be a non-empty array' },
        { status: 400 }
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

    // Verify all tags belong to user
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id')
      .eq('user_id', user.id)
      .in('id', tagIds)

    if (tagsError) {
      console.error('Tags verification error:', tagsError)
      return NextResponse.json(
        { error: 'Failed to verify tags' },
        { status: 500 }
      )
    }

    if (tags.length !== tagIds.length) {
      return NextResponse.json(
        { error: 'One or more tags not found or access denied' },
        { status: 404 }
      )
    }

    // Get existing note-tag relationships to avoid duplicates
    const { data: existingRelations, error: existingError } = await supabase
      .from('note_tags')
      .select('tag_id')
      .eq('note_id', noteId)

    if (existingError) {
      console.error('Existing relations error:', existingError)
      return NextResponse.json(
        { error: 'Failed to check existing relationships' },
        { status: 500 }
      )
    }

    const existingTagIds = existingRelations.map(rel => rel.tag_id)
    const newTagIds = tagIds.filter((tagId: string) => !existingTagIds.includes(tagId))

    if (newTagIds.length === 0) {
      return NextResponse.json(
        { error: 'All specified tags are already associated with this note' },
        { status: 400 }
      )
    }

    // Create new note-tag relationships
    const relationshipData = newTagIds.map((tagId: string) => ({
      note_id: noteId,
      tag_id: tagId
    }))

    const { error: insertError } = await supabase
      .from('note_tags')
      .insert(relationshipData)

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create note-tag relationships' },
        { status: 500 }
      )
    }

    // Fetch updated note with all tags
    const { data: updatedNote, error: fetchError } = await supabase
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
      .single()

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch updated note' },
        { status: 500 }
      )
    }

    // Format the response
    const formattedNote = {
      ...updatedNote,
      tags: updatedNote.note_tags?.map((nt: any) => nt.tags).filter(Boolean) || []
    }
    delete (formattedNote as any).note_tags

    return NextResponse.json({
      success: true,
      message: `Added ${newTagIds.length} tag(s) to note`,
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