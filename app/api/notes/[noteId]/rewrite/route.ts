import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rewriteTranscriptWithGemini } from '@/lib/gemini'

// POST /api/notes/[noteId]/rewrite - Rewrite note content using original transcript and user instructions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params
    const { instructions } = await request.json()

    if (!instructions || typeof instructions !== 'string') {
      return NextResponse.json({ error: 'Instructions are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Validate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch note and verify ownership
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single()

    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 })
    }

    const transcript: string | null = note.original_transcript || note.processed_content || null
    if (!transcript) {
      return NextResponse.json({ error: 'No transcript available to rewrite' }, { status: 400 })
    }

    // Generate rewritten content
    let rewritten: string
    try {
      rewritten = await rewriteTranscriptWithGemini(transcript, instructions)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Rewrite failed'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    // Update note content
    const { data: updated, error: updateError } = await supabase
      .from('notes')
      .update({ processed_content: rewritten, updated_at: new Date().toISOString(), status: 'completed' })
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
      return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
    }

    return NextResponse.json({ success: true, note: updated })
  } catch (error) {
    console.error('Rewrite route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


