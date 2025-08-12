import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing storage configuration...');
    console.log('🧪 Environment check:', {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });
    
    // Log request headers to see cookies
    const cookies = request.headers.get('cookie');
    console.log('🧪 Request cookies:', cookies ? 'Present' : 'Missing');
    console.log('🧪 Request headers:', Object.fromEntries(request.headers.entries()));
    
    const supabase = await createClient()
    
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        details: authError?.message
      })
    }

    // Test storage bucket access
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('🧪 Available buckets:', buckets, 'Error:', bucketsError);

    // Test file upload to storage (small test file)
    const testContent = new Uint8Array([1, 2, 3, 4, 5]); // 5 bytes
    const testFileName = `${user.id}/test-${Date.now()}.bin`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(testFileName, testContent, {
        contentType: 'application/octet-stream',
        upsert: false
      })

    console.log('🧪 Test upload result:', uploadData, 'Error:', uploadError);

    // Clean up test file if upload succeeded
    if (uploadData && !uploadError) {
      await supabase.storage.from('audio-files').remove([testFileName])
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      storage: {
        buckets: buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })),
        bucketsError: bucketsError?.message,
        testUpload: {
          success: !uploadError,
          error: uploadError?.message,
          path: uploadData?.path
        }
      }
    })
  } catch (error) {
    console.error('🧪 Storage test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}