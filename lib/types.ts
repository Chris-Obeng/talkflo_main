// Database types for TalkFlo application

export interface Note {
  id: string
  user_id: string
  title: string
  original_transcript?: string | null
  processed_content?: string | null
  audio_url?: string | null
  audio_duration?: number | null
  status: 'processing' | 'completed' | 'failed'
  error_message?: string | null
  created_at: string
  updated_at: string
  tags?: Tag[]
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color?: string | null
  created_at: string
  usage_count?: number
}

export interface NoteTag {
  id: string
  note_id: string
  tag_id: string
  created_at: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  error?: string
  data?: T
}

export interface NotesResponse extends ApiResponse {
  notes: Note[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface NoteResponse extends ApiResponse {
  note: Note
}

export interface TagsResponse extends ApiResponse {
  tags: Tag[]
}

export interface TagResponse extends ApiResponse {
  tag: Tag
}

// Form and validation types
export interface CreateTagRequest {
  name: string
  color?: string
}

export interface UpdateTagRequest {
  name?: string
  color?: string | null
}

export interface UpdateNoteRequest {
  title?: string
  processed_content?: string
}

export interface AddTagsToNoteRequest {
  tagIds: string[]
}

// Gemini API types
export interface GeminiTranscriptionResponse {
  transcript: string
  confidence?: number
  language?: string
  duration?: number
}

export interface GeminiProcessingResponse {
  processedContent: string
  title?: string
  summary?: string
  keyPoints?: string[]
}

// Audio processing types
export interface AudioProcessingJob {
  noteId: string
  userId: string
  audioUrl: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

// Storage types
export interface StorageFile {
  path: string
  url: string
  size: number
  type: string
}