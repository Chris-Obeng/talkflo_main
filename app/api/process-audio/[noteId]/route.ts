import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/process-audio/[noteId] - Fallback processing route
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

    // Fetch the note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single()

    if (noteError || !note) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      )
    }

    // Check if note is stuck in processing
    if (note.status !== 'processing') {
      return NextResponse.json(
        { error: 'Note is not in processing status' },
        { status: 400 }
      )
    }

    // Fallback processing: Mark as completed with basic content
    const fallbackContent = `**Audio Note**

This audio file was uploaded successfully but automatic transcription is not yet configured.

**File Information:**
- Duration: ${note.audio_duration ? `${note.audio_duration} seconds` : 'Unknown'}
- Uploaded: ${new Date(note.created_at).toLocaleString()}

**To enable automatic transcription:**
1. Add your Google Gemini API key to environment variables
2. Add your Supabase Service Role key to environment variables
3. Deploy the Edge Functions for background processing

**Manual Options:**
- Download the audio file to transcribe manually
- Use external transcription services
- Update this note with your own content`

    // Update the note with fallback content
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        original_transcript: 'Transcription not available - please configure API keys',
        processed_content: fallbackContent,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)

    if (updateError) {
      console.error('Failed to update note:', updateError)
      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      )
    }

    console.log(`✅ Applied fallback processing to note ${noteId}`)

    return NextResponse.json({
      success: true,
      message: 'Note processed with fallback content',
      noteId: noteId
    })

  } catch (error) {
    console.error('Fallback processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/process-audio/[noteId] - Check processing status and apply fallback if needed
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

    // Fetch the note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single()

    if (noteError || !note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

      // Check if note has been processing for too long (>2 minutes)
  const processingTime = Date.now() - new Date(note.created_at).getTime()
  const twoMinutes = 2 * 60 * 1000

  if (note.status === 'processing' && processingTime > twoMinutes) {
    console.log(`⏰ Note ${noteId} has been processing for ${Math.round(processingTime/1000)}s, applying fallback`)
    
    // Apply fallback directly without recursive API calls
    const fallbackContent = `**Audio Note**

This audio file was uploaded successfully but automatic transcription took too long.

**File Information:**
- Duration: ${note.audio_duration ? `${note.audio_duration} seconds` : 'Unknown'}
- Uploaded: ${new Date(note.created_at).toLocaleString()}

**To enable automatic transcription:**
1. Add your Google Gemini API key to environment variables
2. Add your Supabase Service Role key to environment variables
3. Deploy the Edge Functions for background processing

**Manual Options:**
- Download the audio file to transcribe manually
- Use external transcription services
- Update this note with your own content`

    // Update the note with fallback content directly
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        original_transcript: 'Transcription not available - processing timeout',
        processed_content: fallbackContent,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)

    if (updateError) {
      console.error('Failed to update note with fallback:', updateError)
    } else {
      console.log(`✅ Applied fallback processing to note ${noteId}`)
      return NextResponse.json({
        success: true,
        message: 'Applied fallback processing due to timeout',
        action: 'fallback_applied'
      })
    }
  }

    return NextResponse.json({
      success: true,
      note: note,
      processing_time_ms: processingTime
    })

  } catch (error) {
    console.error('Processing status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}