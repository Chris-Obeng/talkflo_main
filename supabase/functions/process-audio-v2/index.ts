// Edge Function TypeScript is compiled in Deno; these types are resolved at deploy time.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createClient } from "jsr:@supabase/supabase-js@2"

// Environment variables
// Provide a loose Deno declaration so local type-checking doesn't fail
// in environments without Deno global types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!

const GEMINI_AUDIO_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const GEMINI_PRO_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent'

interface ProcessAudioRequest {
  noteId: string
  audioUrl: string
  userId: string
  isAppend?: boolean
}

// Enhanced error handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateNoteWithError(supabase: any, noteId: string, error: string) {
  await supabase
    .from('notes')
    .update({
      status: 'failed',
      error_message: error,
      updated_at: new Date().toISOString()
    })
    .eq('id', noteId)
}

/**
 * Transcribe audio using Google Gemini Chirp with enhanced error handling
 */
async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    console.log('🎵 Starting audio transcription for:', audioUrl)
    
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables')
    }
    
    // Download audio file
    console.log('📥 Downloading audio file...')
    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio file: ${audioResponse.status} ${audioResponse.statusText}`)
    }

    const contentType = audioResponse.headers.get('content-type') || 'audio/webm'
    console.log('📄 Audio content type:', contentType)
    
    // Check file size
    const contentLength = audioResponse.headers.get('content-length')
    if (contentLength) {
      const fileSizeMB = parseInt(contentLength) / (1024 * 1024)
      console.log(`📏 Audio file size: ${fileSizeMB.toFixed(2)} MB`)
      
      if (fileSizeMB > 10) {
        throw new Error(`Audio file too large: ${fileSizeMB.toFixed(2)} MB (max 10MB for Gemini API)`)
      }
    }

    const audioBuffer = await audioResponse.arrayBuffer()
    console.log('📦 Audio buffer size:', audioBuffer.byteLength, 'bytes')
    
    // Convert to base64
    console.log('🔄 Converting to base64...')
    // Efficiently convert ArrayBuffer to Base64 without using spread operator
    let binary = ''
    const bytes = new Uint8Array(audioBuffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const audioBase64 = btoa(binary)
    console.log('✅ Base64 conversion complete, length:', audioBase64.length)

    // Special handling for WebM files - try to use audio/webm MIME type
    let mimeType = contentType
    if (contentType.includes('webm')) {
      mimeType = 'audio/webm'
      console.log('🎬 Detected WebM format, using audio/webm MIME type')
    }

    // Prepare request for Gemini Audio
    const requestBody = {
      contents: [{
        parts: [{
          inline_data: {
            mime_type: mimeType,
            data: audioBase64
          }
        }, {
          text: "Please transcribe this audio file accurately. Return only the transcription text."
        }]
      }],
      generation_config: {
        temperature: 0.1,
        top_p: 0.8,
        max_output_tokens: 8192
      }
    }

    console.log('🚀 Sending request to Gemini Audio API...')
    // Make API call to Gemini 2.5 Flash
    const response = await fetch(`${GEMINI_AUDIO_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📨 Gemini API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error response:', errorText)
      
      if (response.status === 400) {
        throw new Error(`Gemini API rejected the audio format (${mimeType}). Try recording in a different format.`)
      } else if (response.status === 403) {
        throw new Error('Gemini API key is invalid or has insufficient permissions')
      } else {
        throw new Error(`Gemini Audio API error: ${response.status} - ${errorText}`)
      }
    }

    const result = await response.json()
    console.log('📋 Gemini API response received')
    
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('No transcription candidates returned from Gemini API')
    }

    const transcript = result.candidates[0].content?.parts?.[0]?.text
    if (!transcript) {
      throw new Error('No transcript text found in Gemini API response')
    }

    console.log('✅ Transcription successful, length:', transcript.length, 'characters')
    return transcript.trim()

  } catch (error) {
    console.error('❌ Transcription error:', error)
    throw error
  }
}

/**
 * Process text using Gemini 2.5 Pro with enhanced error handling
 */
async function processText(transcript: string): Promise<string> {
  try {
    console.log('🤖 Starting content processing...')
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('No transcript provided for processing')
    }
    
    const prompt = `You are an AI assistant that converts unstructured voice recordings into clean, organized text. Your goal is to transform rambling, conversational speech into polished, readable notes while preserving all important information and the speaker's intent.

CORE PRINCIPLES:
1. Preserve all meaningful content - never lose important information
2. Maintain the speaker's voice and personality
3. Create clear, scannable text that's easy to read
4. Organize related ideas together
5. Remove speech artifacts without changing meaning

PROCESSING STEPS:
1. CONTENT ANALYSIS:
   - Identify the purpose (note-taking, brainstorming, diary entry, meeting notes)
   - Determine main themes and subjects
   - Recognize natural breaks, transitions, and logical groupings

2. CONTENT CLEANING:
   - Remove filler words ("um", "uh", "like", "you know") and repetitive phrases
   - Fix grammar and sentence structure while preserving meaning
   - Handle incomplete thoughts by either completing logical sentences or removing fragments
   - Merge scattered thoughts about the same topic

3. ORGANIZATION & STRUCTURE:
   - Create logical paragraph divisions with clear breaks
   - Convert lists or multiple related items into bullet format
   - Add section headers for longer notes with multiple topics
   - Reorder content for better logical progression and flow

4. TONE & STYLE ENHANCEMENT:
   - Maintain consistent voice throughout
   - Simplify complex or unclear expressions for clarity
   - Remove redundancy while preserving key information
   - Elevate casual speech to more polished writing while keeping authenticity

CONTEXT-SPECIFIC PROCESSING:
- For Meeting Notes: Extract action items and decisions, identify key participants, organize by topics, highlight deadlines
- For Brainstorming: Group similar ideas, preserve creative language, use bullet points, maintain energy and enthusiasm
- For Personal Notes/Diary: Preserve emotional tone and personal voice, organize chronologically or thematically, keep intimate language
- For Learning/Study Notes: Organize by concepts, create hierarchical structure, extract key definitions, format for easy review

SENTIMENT PRESERVATION:
- Maintain emotional tone (excited, concerned, urgent, thoughtful)
- Preserve speaker's emphasis and enthusiasm
- Keep personal expressions and unique language patterns

FORMATTING GUIDELINES:
- Return ONLY the cleaned note content. Do not include any preface, explanation, labels, or headings like "Cleaned Transcript", "Transcript", "Title:", "Summary:", etc.
- Do NOT add an overall document title at the top; start directly with the body content.
- Use simple markdown within the body when it improves readability (e.g., bullet points, short section headings), but avoid decorative wrappers or leading/trailing asterisks.
- Do NOT wrap the response in quotes or code fences.
- Ensure proper paragraph breaks and white space for scanning.

COMMON PITFALLS TO AVOID:
- Over-editing that loses the speaker's authentic voice
- Removing important context or emotional nuance
- Creating overly formal tone for casual personal notes
- Missing the main point while focusing on minor grammar issues
- Adding information that wasn't in the original speech

Original transcript:
${transcript}`

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generation_config: {
        temperature: 0.3,
        top_p: 0.8,
        max_output_tokens: 8192
      }
    }

    console.log('🚀 Sending request to Gemini Pro API...')
    // Make API call to Gemini 2.5 Pro
    const response = await fetch(`${GEMINI_PRO_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📨 Gemini Pro response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini Pro error response:', errorText)
      throw new Error(`Gemini Pro API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('No processing candidates returned from Gemini Pro API')
    }

    const processedContent = result.candidates[0].content?.parts?.[0]?.text
    if (!processedContent) {
      throw new Error('No processed content found in Gemini Pro response')
    }

    console.log('✅ Content processing successful')
    return processedContent.trim()

  } catch (error) {
    console.error('❌ Content processing error:', error)
    throw error
  }
}

/**
 * Generate title using Gemini with enhanced error handling
 */
async function generateTitle(content: string): Promise<string> {
  try {
    console.log('📝 Generating title...')
    
    const prompt = `You will receive the cleaned body of a note. Generate a concise, descriptive title (max 60 characters).

Rules:
- Return ONLY the title text. Do not include quotes, labels, punctuation wrappers, or extra lines.
- Make it specific, not generic. Prefer keywords from the note.

Content body:
${content.substring(0, 1000)}...

Respond with ONLY the title.`

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generation_config: {
        temperature: 0.4,
        top_p: 0.8,
        max_output_tokens: 100
      }
    }

    // Make API call to Gemini Pro
    const response = await fetch(`${GEMINI_PRO_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini title generation error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('No title candidates returned')
    }

    const title = result.candidates[0].content?.parts?.[0]?.text
    if (!title) {
      throw new Error('No title found in response')
    }

    // Clean and limit title length
    const cleanTitle = title.trim().replace(/^["']|["']$/g, '') // Remove quotes
    const finalTitle = cleanTitle.length > 60 ? cleanTitle.substring(0, 60).trim() + '...' : cleanTitle
    
    console.log('✅ Title generated:', finalTitle)
    return finalTitle

  } catch (error) {
    console.error('⚠️ Title generation error (using fallback):', error)
    // Local deterministic fallback: derive a concise title from content
    try {
      // Prefer first markdown heading if present
      const headingMatch = content.match(/^#{1,3}\s+(.+)$/m)
      if (headingMatch && headingMatch[1]) {
        const heading = headingMatch[1].trim()
        return heading.length > 60 ? heading.slice(0, 60).trim() + '...' : heading
      }

      // Otherwise, take the first non-empty line
      const firstLine = content.split(/\r?\n/).map(l => l.trim()).find(l => l.length > 0)
      if (firstLine) {
        // If line is very long, try to cut at a sentence boundary
        const sentence = firstLine.split(/[.!?]\s/)[0] || firstLine
        const candidate = sentence.length > 60 ? sentence.slice(0, 60).trim() + '...' : sentence
        if (candidate.length >= 5) return candidate
      }

      // Fallback to first sentence from the whole content
      const sentenceFromContent = content.split(/[.!?]\s/)[0]?.trim()
      if (sentenceFromContent && sentenceFromContent.length >= 5) {
        return sentenceFromContent.length > 60 ? sentenceFromContent.slice(0, 60).trim() + '...' : sentenceFromContent
      }

      // Final fallback
      return `Untitled note (${new Date().toLocaleDateString()})`
    } catch {
      return `Untitled note (${new Date().toLocaleDateString()})`
    }
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  let noteId: string | undefined

  try {
    console.log('🎬 === AUDIO PROCESSING STARTED ===')
    
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    const body = await req.json()
    const { noteId: requestNoteId, audioUrl, userId, isAppend } = body as ProcessAudioRequest
    noteId = requestNoteId

    console.log('📋 Request details:', { noteId, audioUrl, userId, isAppend })

    if (!noteId || !audioUrl || !userId) {
      const error = 'Missing required fields: noteId, audioUrl, userId'
      console.error('❌', error)
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get existing note data if appending
    let existingNote = null
    if (isAppend) {
      console.log('📖 Fetching existing note for append operation...')
      const { data: noteData, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', userId)
        .single()

      if (fetchError || !noteData) {
        const error = 'Note not found for append operation'
        console.error('❌', error)
        return new Response(JSON.stringify({ error }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      existingNote = noteData
      console.log('📖 Existing note found:', existingNote.title)
    }

    // Update note status to processing
    console.log('🔄 Updating note status to processing...')
    await supabase
      .from('notes')
      .update({ 
        status: 'processing',
        error_message: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)

    try {
      // Step 1: Transcribe audio
      console.log('📝 === STEP 1: TRANSCRIPTION ===')
      const transcript = await transcribeAudio(audioUrl)
      
      // Step 2: Process content
      console.log('🤖 === STEP 2: CONTENT PROCESSING ===')
      let processedContent: string
      let finalTitle: string
      let finalTranscript: string

      if (isAppend && existingNote) {
        // For append operations, combine with existing content
        console.log('🔗 Appending to existing content...')
        
        // Combine transcripts
        const existingTranscript = existingNote.original_transcript || ''
        finalTranscript = existingTranscript + (existingTranscript ? '\n\n--- New Recording ---\n\n' : '') + transcript
        
        // Process the new transcript and append to existing content
        const newProcessedContent = await processText(transcript)
        const existingProcessedContent = existingNote.processed_content || ''
        processedContent = existingProcessedContent + (existingProcessedContent ? '\n\n' : '') + newProcessedContent
        
        // Keep the existing title for append operations
        finalTitle = existingNote.title || 'Untitled Note'
        console.log('🔗 Content appended to existing note')
      } else {
        // For new notes, process normally
        processedContent = await processText(transcript)
        finalTranscript = transcript
        
        // Step 3: Generate title
        console.log('📝 === STEP 3: TITLE GENERATION ===')
        finalTitle = await generateTitle(processedContent)
      }

      // Update note with results
      console.log('💾 === STEP 4: SAVING RESULTS ===')
      const { data: updatedNote, error: updateError } = await supabase
        .from('notes')
        .update({
          title: finalTitle,
          original_transcript: finalTranscript,
          processed_content: processedContent,
          status: 'completed',
          error_message: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select('*')
        .single()

      if (updateError) {
        throw new Error(`Failed to update note with processed content: ${updateError.message}`)
      }

      console.log('🎉 === PROCESSING COMPLETED SUCCESSFULLY ===')
      return new Response(JSON.stringify({
        success: true,
        message: 'Audio processing completed successfully',
        note: updatedNote
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })

    } catch (processingError) {
      const errorMessage = processingError instanceof Error ? processingError.message : 'Unknown processing error'
      console.error('❌ === PROCESSING FAILED ===')
      console.error('Error details:', errorMessage)
      
      // Update status to failed with detailed error message
      if (noteId) {
        await updateNoteWithError(supabase, noteId, errorMessage)
      }

      return new Response(JSON.stringify({
        error: 'Audio processing failed',
        details: errorMessage
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ === UNEXPECTED ERROR ===')
    console.error('Error details:', errorMessage)
    
    if (noteId) {
      await updateNoteWithError(supabase, noteId, errorMessage)
    }

    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: errorMessage
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})