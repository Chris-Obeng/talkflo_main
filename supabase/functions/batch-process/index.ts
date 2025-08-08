import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface BatchProcessRequest {
  userId: string
  noteIds?: string[]
  status?: 'processing' | 'failed'
  maxBatchSize?: number
}

/**
 * Process pending notes in batch
 */
async function processPendingNotes(userId: string, maxBatchSize: number = 5, supabase: any) {
  try {
    // Get pending notes for the user
    const { data: pendingNotes, error } = await supabase
      .from('notes')
      .select('id, audio_url, user_id')
      .eq('user_id', userId)
      .eq('status', 'processing')
      .order('created_at', { ascending: true })
      .limit(maxBatchSize)

    if (error) {
      throw new Error(`Failed to fetch pending notes: ${error.message}`)
    }

    if (!pendingNotes || pendingNotes.length === 0) {
      return {
        success: true,
        message: 'No pending notes to process',
        processed: 0
      }
    }

    console.log(`Found ${pendingNotes.length} pending notes to process`)

    const processAudioUrl = `${SUPABASE_URL}/functions/v1/process-audio`
    const results = []

    // Process each note
    for (const note of pendingNotes) {
      try {
        console.log(`Processing note ${note.id}`)
        
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

        if (response.ok) {
          results.push({ noteId: note.id, status: 'triggered' })
          console.log(`Successfully triggered processing for note ${note.id}`)
        } else {
          results.push({ noteId: note.id, status: 'failed', error: `HTTP ${response.status}` })
          console.error(`Failed to trigger processing for note ${note.id}: ${response.status}`)
        }

      } catch (error) {
        results.push({ noteId: note.id, status: 'error', error: error.message })
        console.error(`Error processing note ${note.id}:`, error)
      }

      // Add small delay between requests to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return {
      success: true,
      message: `Batch processing initiated for ${pendingNotes.length} notes`,
      processed: pendingNotes.length,
      results
    }

  } catch (error) {
    console.error('Error in batch processing:', error)
    throw error
  }
}

/**
 * Retry failed notes
 */
async function retryFailedNotes(userId: string, maxBatchSize: number = 3, supabase: any) {
  try {
    // Get failed notes for the user
    const { data: failedNotes, error } = await supabase
      .from('notes')
      .select('id, audio_url, user_id')
      .eq('user_id', userId)
      .eq('status', 'failed')
      .order('updated_at', { ascending: true })
      .limit(maxBatchSize)

    if (error) {
      throw new Error(`Failed to fetch failed notes: ${error.message}`)
    }

    if (!failedNotes || failedNotes.length === 0) {
      return {
        success: true,
        message: 'No failed notes to retry',
        retried: 0
      }
    }

    console.log(`Found ${failedNotes.length} failed notes to retry`)

    // Reset status to processing before retrying
    const noteIds = failedNotes.map(note => note.id)
    await supabase
      .from('notes')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .in('id', noteIds)

    // Use the same batch processing logic
    const result = await processPendingNotes(userId, maxBatchSize, supabase)
    
    return {
      success: true,
      message: `Retry initiated for ${failedNotes.length} failed notes`,
      retried: failedNotes.length,
      ...result
    }

  } catch (error) {
    console.error('Error retrying failed notes:', error)
    throw error
  }
}

/**
 * Clean up old failed notes
 */
async function cleanupOldNotes(userId: string, olderThanDays: number = 30, supabase: any) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    // Find old failed notes
    const { data: oldNotes, error: fetchError } = await supabase
      .from('notes')
      .select('id, audio_url')
      .eq('user_id', userId)
      .eq('status', 'failed')
      .lt('updated_at', cutoffDate.toISOString())

    if (fetchError) {
      throw new Error(`Failed to fetch old notes: ${fetchError.message}`)
    }

    if (!oldNotes || oldNotes.length === 0) {
      return {
        success: true,
        message: 'No old failed notes to clean up',
        cleaned: 0
      }
    }

    console.log(`Found ${oldNotes.length} old failed notes to clean up`)

    // Delete the notes (this will also trigger cascade deletes for note_tags)
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'failed')
      .lt('updated_at', cutoffDate.toISOString())

    if (deleteError) {
      throw new Error(`Failed to delete old notes: ${deleteError.message}`)
    }

    // TODO: Also clean up associated audio files from storage
    // This would require additional logic to safely delete files

    return {
      success: true,
      message: `Cleaned up ${oldNotes.length} old failed notes`,
      cleaned: oldNotes.length
    }

  } catch (error) {
    console.error('Error cleaning up old notes:', error)
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

    // Parse request body
    const { userId, noteIds, status, maxBatchSize = 5 }: BatchProcessRequest = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: userId' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    let result

    if (status === 'failed') {
      // Retry failed notes
      result = await retryFailedNotes(userId, maxBatchSize, supabase)
    } else if (noteIds && noteIds.length > 0) {
      // Process specific notes (not implemented in this version)
      return new Response(
        JSON.stringify({ error: 'Processing specific noteIds not yet implemented' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    } else {
      // Process pending notes
      result = await processPendingNotes(userId, maxBatchSize, supabase)
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Batch processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Batch processing failed',
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