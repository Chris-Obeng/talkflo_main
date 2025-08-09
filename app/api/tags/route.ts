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

    // Step 1: Fetch user's tags (no joins to avoid PostgREST aggregate quirks)
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (tagsError) {
      console.error('Database error (tags):', tagsError)
      return NextResponse.json(
        { error: 'Failed to fetch tags' },
        { status: 500 }
      )
    }

    if (!tags || tags.length === 0) {
      return NextResponse.json({ success: true, tags: [] })
    }

    // Step 2: Fetch related note_tags rows for these tag ids and compute counts
    const tagIds = tags.map((t) => t.id)
    const { data: noteTags, error: noteTagsError } = await supabase
      .from('note_tags')
      .select('tag_id')
      .in('tag_id', tagIds)

    if (noteTagsError) {
      // If counting fails for any reason, still return the tags without usage counts
      console.warn('Warning: failed to fetch note_tag counts. Returning tags without usage counts.', noteTagsError)
      return NextResponse.json({ success: true, tags })
    }

    const usageCountByTagId: Record<string, number> = {}
    for (const rel of noteTags || []) {
      usageCountByTagId[rel.tag_id] = (usageCountByTagId[rel.tag_id] || 0) + 1
    }

    const formattedTags = tags.map((t) => ({
      ...t,
      usage_count: usageCountByTagId[t.id] || 0,
    }))

    return NextResponse.json({ success: true, tags: formattedTags })
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
      .select('*')
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
      // Make tag creation idempotent: return the existing tag as a success.
      return NextResponse.json({
        success: true,
        message: 'Tag already exists',
        tag: {
          ...existingTag,
          usage_count: undefined
        }
      })
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