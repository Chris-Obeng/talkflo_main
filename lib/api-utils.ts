/**
 * API utility functions for TalkFlo
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from './validation'

// Standard error responses
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function createErrorResponse(error: string, statusCode: number = 500) {
  return NextResponse.json({ error }, { status: statusCode })
}

export function createSuccessResponse(data: Record<string, unknown>, statusCode: number = 200) {
  return NextResponse.json({ success: true, ...data }, { status: statusCode })
}

// Authentication middleware
export async function authenticateUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new APIError('Unauthorized', 401)
  }
  
  return { user, supabase }
}

// Rate limiting middleware
export function rateLimitUser(userId: string, maxRequests: number = 100) {
  const rateLimitResult = checkRateLimit(userId, maxRequests)
  
  if (!rateLimitResult.allowed) {
    const resetTime = rateLimitResult.resetTime || Date.now() + 60000
    const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000)
    
    throw new APIError(
      `Rate limit exceeded. Try again in ${secondsUntilReset} seconds.`,
      429
    )
  }
}

// Database query helpers
import { SupabaseClient } from '@supabase/supabase-js';

export async function verifyNoteOwnership(supabase: SupabaseClient, noteId: string, userId: string) {
  const { data: note, error } = await supabase
    .from('notes')
    .select('id')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single()

  if (error || !note) {
    throw new APIError('Note not found or access denied', 404)
  }
  
  return note
}

export async function verifyTagOwnership(supabase: SupabaseClient, tagId: string, userId: string) {
  const { data: tag, error } = await supabase
    .from('tags')
    .select('id')
    .eq('id', tagId)
    .eq('user_id', userId)
    .single()

  if (error || !tag) {
    throw new APIError('Tag not found or access denied', 404)
  }
  
  return tag
}

// File utilities
export function generateUniqueFileName(userId: string, originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  const extension = originalName.split('.').pop() || 'mp3'
  return `${userId}/${timestamp}-${random}.${extension}`
}

export function extractFilePathFromURL(url: string): string {
  const urlParts = url.split('/')
  return urlParts.slice(-2).join('/') // user_id/filename
}

// Request body parsing with validation
export async function parseJSONBody(request: Request) {
  try {
    return await request.json()
  } catch {
    throw new APIError('Invalid JSON in request body', 400)
  }
}

// Logging utilities
export function logAPIRequest(method: string, path: string, userId?: string, startTime?: number) {
  const duration = startTime ? Date.now() - startTime : 0
  console.log(`[API] ${method} ${path} - User: ${userId || 'anonymous'} - Duration: ${duration}ms`)
}

export function logAPIError(error: Error, method: string, path: string, userId?: string) {
  console.error(`[API Error] ${method} ${path} - User: ${userId || 'anonymous'}`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })
}

// Response formatting helpers
export function formatNoteWithTags(note: Record<string, unknown> & { note_tags: { tags: unknown }[] }) {
  return {
    ...note,
    tags: note.note_tags?.map((nt) => nt.tags).filter(Boolean) || []
  }
}

export function formatTagWithUsageCount(tag: Record<string, unknown> & { note_tags: unknown[] }) {
  return {
    ...tag,
    usage_count: tag.note_tags?.length || 0
  }
}

// Generic error handler for API routes
export function handleAPIError(error: Error, method: string, path: string, userId?: string) {
  logAPIError(error, method, path, userId)
  
  if (error instanceof APIError) {
    return createErrorResponse(error.message, error.statusCode)
  }
  
  // Generic server error
  return createErrorResponse('Internal server error', 500)
}