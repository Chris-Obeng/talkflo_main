/**
 * Script to apply database migrations to Supabase
 * Run with: node supabase/apply-migrations.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL')
    console.error('- SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigrations() {
    const migrationsDir = path.join(__dirname, 'migrations')
    
    try {
        const files = await fs.readdir(migrationsDir)
        const sqlFiles = files
            .filter(file => file.endsWith('.sql'))
            .sort() // Apply in alphabetical order
        
        console.log(`Found ${sqlFiles.length} migration files`)
        
        for (const file of sqlFiles) {
            console.log(`\nApplying migration: ${file}`)
            
            const filePath = path.join(migrationsDir, file)
            const sql = await fs.readFile(filePath, 'utf8')
            
            const { error } = await supabase.rpc('execute_sql', { sql })
            
            if (error) {
                console.error(`Error applying ${file}:`, error)
                process.exit(1)
            }
            
            console.log(`✓ Successfully applied ${file}`)
        }
        
        console.log('\n🎉 All migrations applied successfully!')
        
    } catch (error) {
        console.error('Error applying migrations:', error)
        process.exit(1)
    }
}

applyMigrations()