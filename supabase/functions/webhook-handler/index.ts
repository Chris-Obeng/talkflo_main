import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface WebhookPayload {
  type: 'audio_uploaded' | 'processing_complete' | 'processing_failed'
  data: {
    noteId: string
    userId: string
    [key: string]: any
  }
}

/**
 * Handle audio upload webhook
 */
async function handleAudioUploaded(noteId: string, userId: string, supabase: any) {
  try {
    // Get the note details
    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', userId)
      .single()

    if (error || !note) {
      throw new Error('Note not found')
    }

    if (!note.audio_url) {
      throw new Error('No audio URL found in note')
    }

    // Trigger the process-audio-v2 Edge Function
    const processAudioUrl = `${SUPABASE_URL}/functions/v1/process-audio-v2`
    
    const response = await fetch(processAudioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        noteId: note.id,
        audioUrl: note.audio_url,
        userId: note.user_id
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to trigger processing: ${response.status}`)
    }

    console.log(`Successfully triggered processing for note ${noteId}`)
    return { success: true, message: 'Processing triggered' }

  } catch (error) {
    console.error('Error handling audio upload webhook:', error)
    throw error
  }
}

/**
 * Handle processing complete webhook
 */
async function handleProcessingComplete(noteId: string, userId: string, supabase: any) {
  try {
    // Optional: Send notification, update analytics, etc.
    console.log(`Processing completed for note ${noteId} by user ${userId}`)
    
    // You could add logic here to:
    // - Send email/push notifications
    // - Update user analytics
    // - Trigger other workflows
    
    return { success: true, message: 'Processing completion handled' }
    
  } catch (error) {
    console.error('Error handling processing complete webhook:', error)
    throw error
  }
}

/**
 * Handle processing failed webhook
 */
async function handleProcessingFailed(noteId: string, userId: string, supabase: any) {
  try {
    // Optional: Send failure notification, log error, etc.
    console.log(`Processing failed for note ${noteId} by user ${userId}`)
    
    // You could add logic here to:
    // - Send error notifications
    // - Log to external monitoring
    // - Retry processing
    
    return { success: true, message: 'Processing failure handled' }
    
  } catch (error) {
    console.error('Error handling processing failed webhook:', error)
    throw error
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse webhook payload
    const payload: WebhookPayload = await req.json()

    if (!payload.type || !payload.data) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const { noteId, userId } = payload.data

    if (!noteId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: noteId, userId' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    let result

    // Handle different webhook types
    switch (payload.type) {
      case 'audio_uploaded':
        result = await handleAudioUploaded(noteId, userId, supabase)
        break
      
      case 'processing_complete':
        result = await handleProcessingComplete(noteId, userId, supabase)
        break
      
      case 'processing_failed':
        result = await handleProcessingFailed(noteId, userId, supabase)
        break
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown webhook type' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
    }

    return new Response(
      JSON.stringify({
        success: true,
        type: payload.type,
        ...result
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Webhook handler error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})