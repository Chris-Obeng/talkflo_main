import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Allowed audio file types
const ALLOWED_TYPES = [
  'audio/mpeg',
  'audio/wav', 
  'audio/mp4',
  'audio/m4a',
  'audio/aac',
  'audio/ogg',
  'audio/webm'
]

export async function POST(request: NextRequest) {
  try {
    console.log('🎵 Upload API called:', request.method, request.url);
    
    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY) {
      console.error('🎵 Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase environment variables' },
        { status: 500 }
      )
    }
    
    // Create Supabase client with server-side auth
    const supabase = await createClient()
    console.log('🎵 Supabase client created');
    
    // Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🎵 Auth check:', user ? `User: ${user.id}` : 'No user', authError ? `Error: ${authError.message}` : 'No error');
    
    if (authError || !user) {
      console.error('🎵 Authentication failed:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const appendToNoteId = formData.get('appendToNoteId') as string | null
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    console.log('🎵 Request details:', {
      audioFile: audioFile.name,
      size: audioFile.size,
      appendToNoteId: appendToNoteId || 'none (creating new note)',
      isAppendMode: !!appendToNoteId
    });
    
    console.log('🎵 Form data keys:', Array.from(formData.keys()));
    console.log('🎵 appendToNoteId from form:', appendToNoteId);

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      )
    }

    // Validate file type (handle codec specifications in MIME types)
    const normalizedType = audioFile.type.split(';')[0] // Remove codec info
    console.log('🎵 Received file type:', audioFile.type, '→ normalized:', normalizedType)
    
    if (!ALLOWED_TYPES.includes(normalizedType)) {
      console.error('🎵 Invalid file type. Received:', audioFile.type, 'Allowed:', ALLOWED_TYPES)
      return NextResponse.json(
        { error: `Invalid file type: ${audioFile.type}. Supported formats: MP3, WAV, M4A, AAC, OGG, WebM` },
        { status: 400 }
      )
    }

    // Generate unique filename with user ID folder structure
    const timestamp = Date.now()
    const fileExtension = audioFile.name.split('.').pop() || 'mp3'
    const fileName = `${user.id}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`

    // Upload file to Supabase storage
    console.log('🎵 Uploading file:', fileName, 'Type:', audioFile.type, 'Size:', audioFile.size)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(fileName, audioFile, {
        contentType: normalizedType, // Use normalized type for storage
        upsert: false
      })

    if (uploadError) {
      console.error('🎵 Storage upload error:', uploadError)
      console.error('🎵 Upload details:', {
        fileName,
        fileSize: audioFile.size,
        fileType: audioFile.type,
        normalizedType,
        bucket: 'audio-files'
      });
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }
    
    console.log('🎵 File uploaded successfully to storage:', uploadData?.path);

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName)

    // Get audio duration (we'll estimate this or get it from metadata)
    // For now, we'll set it to null and update it during processing
    const audioDuration = null

    let noteData;
    let noteError;

    if (appendToNoteId) {
      // Verify the note exists and belongs to the user
      const { data: existingNote, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', appendToNoteId)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !existingNote) {
        console.error('🎵 Note not found or access denied:', fetchError)
        // Clean up uploaded file
        await supabase.storage.from('audio-files').remove([fileName])
        
        return NextResponse.json(
          { error: 'Note not found or access denied' },
          { status: 404 }
        )
      }

      // Update existing note to processing status and add new audio URL
      const { data: updatedNote, error: updateError } = await supabase
        .from('notes')
        .update({
          audio_url: publicUrl,
          audio_duration: audioDuration,
          status: 'processing'
        })
        .eq('id', appendToNoteId)
        .eq('user_id', user.id)
        .select('*')
        .single()

      noteData = updatedNote
      noteError = updateError
      
      console.log('🎵 Appending to existing note:', appendToNoteId);
    } else {
      // Create initial note record with 'processing' status
      const { data: newNote, error: insertError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          // Use a neutral placeholder; real title will be generated by processing function
          title: 'Processing…',
          audio_url: publicUrl,
          audio_duration: audioDuration,
          status: 'processing'
        })
        .select('*')
        .single()

      noteData = newNote
      noteError = insertError
      
      console.log('🎵 Creating new note');
    }

    if (noteError) {
      console.error('🎵 Database error:', noteError)
      console.error('🎵 Note operation details:', {
        user_id: user.id,
        audio_url: publicUrl,
        status: 'processing',
        operation: appendToNoteId ? 'update' : 'insert'
      });
      
      // Clean up uploaded file
      await supabase.storage.from('audio-files').remove([fileName])
      
      return NextResponse.json(
        { error: `Database error: ${noteError.message}` },
        { status: 500 }
      )
    }
    
    console.log('🎵 Note created successfully:', noteData.id);

    // Trigger processing via webhook handler (uses anon key)
    try {
      const webhookUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/webhook-handler`
      
      // Trigger the webhook handler asynchronously
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY}`
        },
        body: JSON.stringify({
          type: 'audio_uploaded',
          data: {
            noteId: noteData.id,
            userId: user.id,
            isAppend: !!appendToNoteId
          }
        })
      }).catch(error => {
        console.error('Failed to trigger webhook processing:', error)
        // Webhook failed, but file upload was successful
        // The user can manually retry processing later
      })

      console.log(`✅ Triggered webhook processing for note ${noteData.id}`)
    } catch (error) {
      console.error('Error triggering webhook:', error)
      // Continue without blocking the response
    }
    
    return NextResponse.json({
      success: true,
      noteId: noteData.id,
      message: appendToNoteId 
        ? 'Audio file uploaded successfully. Appending to existing note.' 
        : 'Audio file uploaded successfully. Processing started.',
      note: noteData
    }, { status: 201 })

  } catch (error) {
    console.error('🎵 Unexpected error in upload API:', error)
    
    // Ensure we always return JSON, never HTML
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { 
        error: `Upload failed: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}