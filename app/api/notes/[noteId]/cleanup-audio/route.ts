import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/notes/[noteId]/cleanup-audio - Clean up audio file after processing
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

    // Fetch note to get audio URL and verify ownership
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('audio_url, status')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single()

    if (noteError || !note) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      )
    }

    // Only clean up if note is completed and has an audio URL
    if (note.status !== 'completed' || !note.audio_url) {
      return NextResponse.json(
        { success: true, message: 'No cleanup needed' }
      )
    }

    try {
      // Extract file path from URL
      const audioPath = note.audio_url.split('/audio-files/')[1]
      if (audioPath) {
        console.log('🗑️ Deleting audio file:', audioPath)
        
        const { error: deleteError } = await supabase
          .storage
          .from('audio-files')
          .remove([audioPath])
        
        if (deleteError) {
          console.warn('⚠️ Failed to delete audio file:', deleteError.message)
          return NextResponse.json(
            { error: 'Failed to delete audio file' },
            { status: 500 }
          )
        }

        // Clear the audio_url from the note
        const { error: updateError } = await supabase
          .from('notes')
          .update({ audio_url: null })
          .eq('id', noteId)

        if (updateError) {
          console.warn('⚠️ Failed to clear audio_url from note:', updateError.message)
          // Don't fail the request since the file was deleted
        }

        console.log('✅ Audio file cleanup completed successfully')
      }
    } catch (cleanupError) {
      console.error('🗑️ Error during audio cleanup:', cleanupError)
      return NextResponse.json(
        { error: 'Audio cleanup failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Audio file cleaned up successfully'
    })

  } catch (error) {
    console.error('Unexpected error during audio cleanup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}