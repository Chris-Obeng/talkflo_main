import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PUT /api/tags/[id] - Update tag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    if (!name && color === undefined) {
      return NextResponse.json(
        { error: 'At least one field (name, color) must be provided' },
        { status: 400 }
      )
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Tag name must be a non-empty string' },
          { status: 400 }
        )
      }

      if (name.length > 100) {
        return NextResponse.json(
          { error: 'Tag name must be 100 characters or less' },
          { status: 400 }
        )
      }
    }

    // Validate color if provided
    if (color !== undefined && color !== null && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: 'Color must be a valid hex color code (e.g., #FF5733) or null' },
        { status: 400 }
      )
    }

    // Verify tag ownership
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('id, name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingTag) {
      return NextResponse.json(
        { error: 'Tag not found or access denied' },
        { status: 404 }
      )
    }

    // Check if new name conflicts with existing tags (if name is being changed)
    if (name && name.trim() !== existingTag.name) {
      const { data: conflictTag, error: conflictError } = await supabase
        .from('tags')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', name.trim())
        .single()

      if (conflictError && conflictError.code !== 'PGRST116') {
        console.error('Conflict check error:', conflictError)
        return NextResponse.json(
          { error: 'Failed to validate tag name' },
          { status: 500 }
        )
      }

      if (conflictTag) {
        return NextResponse.json(
          { error: 'A tag with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: { name?: string; color?: string | null } = {}
    if (name !== undefined) updateData.name = name.trim()
    if (color !== undefined) updateData.color = color

    // Update tag
    const { data: updatedTag, error: updateError } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        note_tags (count)
      `)
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update tag' },
        { status: 500 }
      )
    }

    // Format response
    const formattedTag = {
      ...updatedTag,
      usage_count: updatedTag.note_tags?.length || 0
    }
    delete (formattedTag as { note_tags?: { count: number }[] }).note_tags

    return NextResponse.json({
      success: true,
      message: 'Tag updated successfully',
      tag: formattedTag
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/tags/[id] - Delete tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify tag ownership
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingTag) {
      return NextResponse.json(
        { error: 'Tag not found or access denied' },
        { status: 404 }
      )
    }

    // Delete all note_tags relationships first (this should happen automatically with CASCADE)
    const { error: relationshipError } = await supabase
      .from('note_tags')
      .delete()
      .eq('tag_id', id)

    if (relationshipError) {
      console.error('Relationship deletion error:', relationshipError)
      // Continue with tag deletion even if this fails (CASCADE should handle it)
    }

    // Delete tag
    const { error: deleteError } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete tag' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}