import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Note: legacy constants removed; route now returns 410

// Legacy route kept for backward compatibility, but not used anymore by the client
// We keep it to return a clear error so large uploads won't attempt to hit this route
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

    // Explicitly block large file uploads via this route to avoid platform limits
    return NextResponse.json(
      { error: 'Direct uploads are no longer supported. The client uploads directly to storage.' },
      { status: 410 }
    )

    // The rest of the old implementation is intentionally disabled

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