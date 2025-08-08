/**
 * Backend deployment script for TalkFlo
 * Applies all database migrations to Supabase
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
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
    console.error('   You need the service role key to apply migrations')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function executeSQLMigration(name, sqlContent) {
    console.log(`\n🔄 Applying migration: ${name}`)
    
    try {
        const { error } = await supabase.rpc('exec_sql', {
            query: sqlContent
        })
        
        if (error) {
            // If exec_sql doesn't exist, try direct query execution
            const { error: queryError } = await supabase.from('_').select('*').limit(1)
            if (queryError && queryError.code === '42P01') {
                // Try using raw SQL execution
                const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseServiceKey,
                        'Authorization': `Bearer ${supabaseServiceKey}`
                    },
                    body: JSON.stringify({ query: sqlContent })
                })
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${await response.text()}`)
                }
            } else {
                throw error
            }
        }
        
        console.log(`✅ Successfully applied: ${name}`)
        return true
        
    } catch (error) {
        console.error(`❌ Error applying ${name}:`, error.message)
        return false
    }
}

async function createStorageBucket() {
    console.log('\n🔄 Creating storage bucket: audio-files')
    
    try {
        // Check if bucket already exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets()
        
        if (listError) {
            console.error('Error listing buckets:', listError)
            return false
        }
        
        const bucketExists = buckets.some(bucket => bucket.name === 'audio-files')
        
        if (bucketExists) {
            console.log('✅ Storage bucket "audio-files" already exists')
            return true
        }
        
        // Create the bucket
        const { error: createError } = await supabase.storage.createBucket('audio-files', {
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
        
        if (createError) {
            console.error('Error creating bucket:', createError)
            return false
        }
        
        console.log('✅ Successfully created storage bucket: audio-files')
        return true
        
    } catch (error) {
        console.error('❌ Error creating storage bucket:', error.message)
        return false
    }
}

async function applyMigrations() {
    const migrationsDir = path.join(__dirname, '../supabase/migrations')
    
    console.log('🚀 Starting TalkFlo backend deployment...')
    console.log(`📁 Migrations directory: ${migrationsDir}`)
    
    try {
        const files = await fs.readdir(migrationsDir)
        const sqlFiles = files
            .filter(file => file.endsWith('.sql') && !file.includes('storage'))
            .sort() // Apply in alphabetical order
        
        console.log(`📋 Found ${sqlFiles.length} migration files`)
        
        let allSuccess = true
        
        // Apply database migrations
        for (const file of sqlFiles) {
            const filePath = path.join(migrationsDir, file)
            const sql = await fs.readFile(filePath, 'utf8')
            const success = await executeSQLMigration(file, sql)
            if (!success) allSuccess = false
        }
        
        // Create storage bucket
        const bucketSuccess = await createStorageBucket()
        if (!bucketSuccess) allSuccess = false
        
        // Apply storage policies
        const storageFile = files.find(file => file.includes('storage'))
        if (storageFile) {
            const filePath = path.join(migrationsDir, storageFile)
            const sql = await fs.readFile(filePath, 'utf8')
            const success = await executeSQLMigration(storageFile, sql)
            if (!success) allSuccess = false
        }
        
        if (allSuccess) {
            console.log('\n🎉 Backend deployment completed successfully!')
            console.log('\n📋 Summary:')
            console.log('✅ Database tables created with RLS policies')
            console.log('✅ Storage bucket created for audio files') 
            console.log('✅ Indexes and triggers applied')
            console.log('✅ All security policies configured')
            console.log('\n🚀 Your TalkFlo backend is ready for use!')
        } else {
            console.log('\n⚠️  Some migrations failed. Please check the errors above.')
            process.exit(1)
        }
        
    } catch (error) {
        console.error('❌ Fatal error during deployment:', error.message)
        process.exit(1)
    }
}

// Run the deployment
applyMigrations()