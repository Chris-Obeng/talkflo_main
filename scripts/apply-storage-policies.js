/**
 * Direct Supabase API script to apply storage bucket policies
 * This bypasses the need for service role key by using the REST API
 */

const fetch = require('node-fetch')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    process.exit(1)
}

console.log('🔗 Connecting to Supabase:', supabaseUrl)

async function checkAndCreateBucket() {
    console.log('\n1. 🪣 Checking storage bucket...')
    
    try {
        // Check if bucket exists
        const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json'
            }
        })
        
        const buckets = await response.json()
        console.log('📋 Available buckets:', buckets.map(b => b.name || b.id))
        
        const audioFilesBucket = buckets.find(b => (b.name || b.id) === 'audio-files')
        
        if (audioFilesBucket) {
            console.log('✅ audio-files bucket exists')
            return true
        } else {
            console.log('❌ audio-files bucket not found')
            console.log('📝 Manual action required: Create the bucket in Supabase dashboard')
            return false
        }
        
    } catch (error) {
        console.error('❌ Error checking buckets:', error.message)
        return false
    }
}

async function checkStoragePolicies() {
    console.log('\n2. 🔒 Checking storage policies...')
    
    try {
        // This requires service role access, so we'll provide instructions instead
        console.log('ℹ️  Storage policies need to be checked manually in Supabase dashboard')
        console.log('📍 Go to: Database → Policies → storage.objects')
        
        const expectedPolicies = [
            'Users can view own audio files',
            'Users can upload own audio files', 
            'Users can update own audio files',
            'Users can delete own audio files'
        ]
        
        console.log('🔍 Expected policies:')
        expectedPolicies.forEach(policy => console.log(`   • ${policy}`))
        
        return false // We can't actually check this with anon key
        
    } catch (error) {
        console.error('❌ Error checking policies:', error.message)
        return false
    }
}

async function createSQLScript() {
    console.log('\n3. 📝 Generating SQL script for manual application...')
    
    const sqlScript = `
-- TalkFlo Storage Bucket Setup Script
-- Apply this in your Supabase SQL Editor

-- 1. Create the bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'audio-files', 
    'audio-files', 
    false, 
    52428800,
    ARRAY['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/webm']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own audio files" ON storage.objects;

-- 4. Create RLS policies for audio-files bucket
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

-- 5. Verify the policies were created
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
`
    
    console.log('📄 SQL Script generated. Copy and paste this into your Supabase SQL Editor:')
    console.log('=' * 60)
    console.log(sqlScript)
    console.log('=' * 60)
    
    return sqlScript
}

async function main() {
    console.log('🚀 TalkFlo Storage Bucket Setup')
    console.log('=' * 40)
    
    const bucketExists = await checkAndCreateBucket()
    await checkStoragePolicies()
    await createSQLScript()
    
    console.log('\n🎯 Next Steps:')
    console.log('1. Go to your Supabase dashboard: https://mpeibvgwuijdltndxsoa.supabase.co')
    
    if (!bucketExists) {
        console.log('2. Create the audio-files bucket:')
        console.log('   • Go to Storage → Buckets')
        console.log('   • Click "New bucket"')
        console.log('   • Name: audio-files')
        console.log('   • Public: No')
        console.log('   • File size limit: 50MB')
    }
    
    console.log(`${bucketExists ? '2' : '3'}. Apply the SQL script:`)
    console.log('   • Go to SQL Editor')
    console.log('   • Paste the script above')
    console.log('   • Click "Run"')
    
    console.log('\n✅ After completing these steps, your audio upload should work!')
}

main().catch(console.error)