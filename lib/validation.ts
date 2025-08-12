/**
 * Validation utilities for TalkFlo API
 */


// File validation constants
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav', 
  'audio/mp4',
  'audio/m4a',
  'audio/aac',
  'audio/ogg',
  'audio/webm'
]

// Validation functions
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No audio file provided' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` 
    }
  }

  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Supported formats: MP3, WAV, M4A, AAC, OGG, WebM' 
    }
  }

  return { valid: true }
}

export function validateTagName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Tag name is required and must be a string' }
  }

  const trimmedName = name.trim()
  if (trimmedName.length === 0) {
    return { valid: false, error: 'Tag name cannot be empty' }
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Tag name must be 100 characters or less' }
  }

  return { valid: true }
}

export function validateHexColor(color: string): { valid: boolean; error?: string } {
  if (!color) {
    return { valid: true } // Color is optional
  }

  if (!/^#[0-9A-F]{6}$/i.test(color)) {
    return { 
      valid: false, 
      error: 'Color must be a valid hex color code (e.g., #FF5733)' 
    }
  }

  return { valid: true }
}

export function validateUUID(uuid: string): { valid: boolean; error?: string } {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: 'Invalid UUID format' }
  }

  return { valid: true }
}

export function validatePaginationParams(limit?: string, offset?: string): {
  valid: boolean
  error?: string
  limit: number
  offset: number
} {
  const parsedLimit = limit ? parseInt(limit) : 20
  const parsedOffset = offset ? parseInt(offset) : 0

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    return { 
      valid: false, 
      error: 'Limit must be a number between 1 and 100',
      limit: 20,
      offset: 0
    }
  }

  if (isNaN(parsedOffset) || parsedOffset < 0) {
    return { 
      valid: false, 
      error: 'Offset must be a non-negative number',
      limit: parsedLimit,
      offset: 0
    }
  }

  return { 
    valid: true, 
    limit: parsedLimit, 
    offset: parsedOffset 
  }
}

// Rate limiting utilities
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  userKey: string, 
  maxRequests: number = 100, 
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; resetTime?: number } {
  const now = Date.now()
  const userRecord = requestCounts.get(userKey)

  if (!userRecord || now > userRecord.resetTime) {
    // Reset or create new record
    requestCounts.set(userKey, { count: 1, resetTime: now + windowMs })
    return { allowed: true }
  }

  if (userRecord.count >= maxRequests) {
    return { allowed: false, resetTime: userRecord.resetTime }
  }

  userRecord.count++
  return { allowed: true }
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes