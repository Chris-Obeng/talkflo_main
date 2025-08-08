import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/tags - Fetch all user tags with usage counts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch tags with usage counts
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select(`
        *,
        note_tags (count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (tagsError) {
      console.error('Database error:', tagsError)
      return NextResponse.json(
        { error: 'Failed to fetch tags' },
        { status: 500 }
      )
    }

    // Format tags with usage counts
    const formattedTags = tags.map(tag => ({
      ...tag,
      usage_count: tag.note_tags?.length || 0
    }))

    // Remove note_tags property
    formattedTags.forEach(tag => {
      delete (tag as any).note_tags
    })

    return NextResponse.json({
      success: true,
      tags: formattedTags
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, color } = body

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tag name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Tag name must be 100 characters or less' },
        { status: 400 }
      )
    }

    // Validate color if provided
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: 'Color must be a valid hex color code (e.g., #FF5733)' },
        { status: 400 }
      )
    }

    // Check if tag name already exists for this user
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name.trim())
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Check error:', checkError)
      return NextResponse.json(
        { error: 'Failed to validate tag name' },
        { status: 500 }
      )
    }

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 409 }
      )
    }

    // Create new tag
    const { data: newTag, error: createError } = await supabase
      .from('tags')
      .insert({
        user_id: user.id,
        name: name.trim(),
        color: color || null
      })
      .select('*')
      .single()

    if (createError) {
      console.error('Create error:', createError)
      return NextResponse.json(
        { error: 'Failed to create tag' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tag created successfully',
      tag: {
        ...newTag,
        usage_count: 0
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}