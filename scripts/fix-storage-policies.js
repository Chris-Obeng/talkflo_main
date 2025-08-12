/**
 * Script to apply storage bucket RLS policies
 * Run this to fix the "new row violates row-level security policy" error
 */

const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
    process.exit(1)
}

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env.local')
    console.error('   You need the service role key to apply storage policies')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function applyStoragePolicies() {
    console.log('🔄 Applying storage bucket policies...')
    
    try {
        // Create the bucket if it doesn't exist
        console.log('1. Creating audio-files bucket...')
        const { error: bucketError } = await supabase.storage.createBucket('audio-files', {
            public: false,
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: [
                'audio/mpeg',
                'audio/wav',
                'audio/mp4',
                'audio/m4a',
                'audio/aac',
                'audio/ogg',
                'audio/webm'
            ]
        })
        
        if (bucketError && bucketError.message !== 'The resource already exists') {
            console.error('❌ Error creating bucket:', bucketError)
        } else {
            console.log('✅ Bucket exists or created successfully')
        }

        // Apply RLS policies via SQL
        console.log('2. Applying RLS policies...')
        
        const sqlPolicies = `
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own audio files" ON storage.objects;

-- Create RLS policies for the audio-files bucket
CREATE POLICY "Users can view own audio files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'audio-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can upload own audio files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'audio-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own audio files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'audio-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own audio files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'audio-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );
        `
        
        // Execute the SQL
        const { error: sqlError } = await supabase.rpc('exec', { sql: sqlPolicies })
        
        if (sqlError) {
            console.error('❌ Error applying SQL policies:', sqlError)
            console.log('\n📋 Please manually apply these policies in your Supabase dashboard:')
            console.log(sqlPolicies)
            console.log('\nGo to: Dashboard > Authentication > Policies > storage.objects')
        } else {
            console.log('✅ RLS policies applied successfully!')
        }

        // Test the policies
        console.log('3. Testing bucket access...')
        const { data: testData, error: testError } = await supabase.storage
            .from('audio-files')
            .list('', { limit: 1 })
        
        if (testError) {
            console.error('❌ Test access failed:', testError)
        } else {
            console.log('✅ Bucket access test successful!')
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error)
    }
}

applyStoragePolicies()
    .then(() => {
        console.log('\n🎉 Storage policies setup complete!')
        console.log('You should now be able to upload audio files.')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Failed to apply storage policies:', error)
        process.exit(1)
    })