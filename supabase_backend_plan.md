# Talkflo Backend Development Guide

## Phase 1: Database Schema Design

### Step 1: Set up Supabase Database Tables

#### 1.1 Create the `folders` table
- **Purpose**: Store user-created folders for organizing notes
- **Fields**:
  - `id` (UUID, primary key, auto-generated)
  - `user_id` (UUID, foreign key to auth.users)
  - `name` (VARCHAR, folder name)
  - `description` (TEXT, optional folder description)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
- **Indexes**: Create index on `user_id` for faster queries
- **RLS Policy**: Users can only access their own folders

#### 1.2 Create the `notes` table
- **Purpose**: Store transcribed and processed notes
- **Fields**:
  - `id` (UUID, primary key, auto-generated)
  - `user_id` (UUID, foreign key to auth.users)
  - `folder_id` (UUID, foreign key to folders table, nullable)
  - `title` (VARCHAR, auto-generated or user-defined)
  - `original_transcript` (TEXT, raw Gemini Chirp output)
  - `processed_content` (TEXT, Gemini 2.5 Pro rewritten content)
  - `audio_url` (VARCHAR, Supabase storage URL)
  - `audio_duration` (INTEGER, duration in seconds)
  - `status` (ENUM: 'processing', 'completed', 'failed')
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
- **Indexes**: Create indexes on `user_id`, `folder_id`, and `created_at`
- **RLS Policy**: Users can only access their own notes

#### 1.3 Create the `tags` table
- **Purpose**: Store available tags for notes
- **Fields**:
  - `id` (UUID, primary key, auto-generated)
  - `user_id` (UUID, foreign key to auth.users)
  - `name` (VARCHAR, tag name)
  - `color` (VARCHAR, hex color code, optional)
  - `created_at` (TIMESTAMP)
- **Constraints**: Unique constraint on `user_id + name`
- **RLS Policy**: Users can only access their own tags

#### 1.4 Create the `note_tags` table (Junction table)
- **Purpose**: Many-to-many relationship between notes and tags
- **Fields**:
  - `id` (UUID, primary key, auto-generated)
  - `note_id` (UUID, foreign key to notes)
  - `tag_id` (UUID, foreign key to tags)
  - `created_at` (TIMESTAMP)
- **Constraints**: Unique constraint on `note_id + tag_id`
- **RLS Policy**: Users can only access their own note-tag relationships

### Step 2: Set up Supabase Storage

#### 2.1 Create Storage Bucket
- Create a bucket named `audio-files`
- Configure bucket policies for authenticated users only
- Set up RLS policies so users can only access their own audio files
- Configure file size limits (e.g., 50MB per file)
- Set allowed file types (mp3, wav, m4a, etc.)

## Phase 2: API Routes Development

### Step 3: Folder Management API Routes

#### 3.1 Create `/api/folders` endpoints
- **GET /api/folders**: Fetch all folders for authenticated user
  - Validate user authentication
  - Query folders table with user_id filter
  - Return folders with note counts
  
- **POST /api/folders**: Create new folder
  - Validate user authentication
  - Validate folder name (required, max length)
  - Check for duplicate folder names
  - Insert into folders table
  - Return created folder

- **PUT /api/folders/[id]**: Update folder
  - Validate user authentication and ownership
  - Validate folder name
  - Update folder in database
  - Return updated folder

- **DELETE /api/folders/[id]**: Delete folder
  - Validate user authentication and ownership
  - Check if folder has notes (handle accordingly)
  - Delete folder from database
  - Return success status

### Step 4: Audio Upload and Processing API Routes

#### 4.1 Create `/api/upload-audio` endpoint
- **POST /api/upload-audio**
  - Validate user authentication
  - Validate audio file (size, format)
  - Generate unique filename
  - Upload file to Supabase storage
  - Create initial note record with 'processing' status
  - Return note ID and upload confirmation
  - Trigger background processing

#### 4.2 Create `/api/process-audio/[noteId]` endpoint
- **POST /api/process-audio/[noteId]**
  - Validate user authentication and note ownership
  - Retrieve audio file from storage
  - Send audio to Google Gemini Chirp for transcription
  - Process transcript with Gemini 2.5 Pro for rewriting
  - Generate title from processed content
  - Update note record with results
  - Update status to 'completed' or 'failed'
  - Return processed note data

### Step 5: Notes Management API Routes

#### 5.1 Create `/api/notes` endpoints
- **GET /api/notes**: Fetch notes with filtering
  - Support query parameters: folder_id, tags, search, limit, offset
  - Validate user authentication
  - Build dynamic query with filters
  - Include folder and tags data
  - Return paginated results

- **GET /api/notes/[id]**: Fetch single note
  - Validate user authentication and ownership
  - Return note with full details including tags

- **PUT /api/notes/[id]**: Update note
  - Validate user authentication and ownership
  - Allow updates to title, folder_id, processed_content
  - Update updated_at timestamp
  - Return updated note

- **DELETE /api/notes/[id]**: Delete note
  - Validate user authentication and ownership
  - Delete audio file from storage
  - Delete note record and related note_tags
  - Return success status

### Step 6: Tags Management API Routes

#### 6.1 Create `/api/tags` endpoints
- **GET /api/tags**: Fetch all user tags
  - Validate user authentication
  - Return tags with usage counts

- **POST /api/tags**: Create new tag
  - Validate user authentication
  - Validate tag name (unique per user)
  - Create tag record
  - Return created tag

- **PUT /api/tags/[id]**: Update tag
  - Validate user authentication and ownership
  - Update tag name/color
  - Return updated tag

- **DELETE /api/tags/[id]**: Delete tag
  - Validate user authentication and ownership
  - Remove all note_tags relationships
  - Delete tag record
  - Return success status

#### 6.2 Create `/api/notes/[noteId]/tags` endpoints
- **POST /api/notes/[noteId]/tags**: Add tags to note
  - Validate user authentication and note ownership
  - Validate tag IDs belong to user
  - Create note_tags relationships
  - Return updated note with tags

- **DELETE /api/notes/[noteId]/tags/[tagId]**: Remove tag from note
  - Validate user authentication and ownership
  - Delete specific note_tags relationship
  - Return success status

## Phase 3: External API Integration

### Step 7: Google Gemini Integration

#### 7.1 Set up Gemini API Configuration
- Store API keys in environment variables
- Create utility functions for API calls
- Implement error handling for API failures
- Set up rate limiting and retry logic

#### 7.2 Implement Gemini Chirp Integration
- Create service function for audio transcription
- Handle different audio formats
- Implement chunking for large audio files
- Add timeout handling
- Return structured transcript data

#### 7.3 Implement Gemini 2.5 Pro Integration
- Create service function for text processing
- Design prompts for rewriting and summarizing
- Implement title generation logic
- Add content formatting rules
- Handle API response parsing

### Step 8: Background Job Processing

#### 8.1 Set up Queue System
- Choose between Vercel Edge Functions, Bull Queue, or similar
- Create job types for audio processing
- Implement retry mechanisms for failed jobs
- Add job status tracking

#### 8.2 Create Processing Pipeline
- Queue audio processing jobs after upload
- Process transcription and rewriting sequentially
- Update database with results
- Handle errors and notifications
- Implement progress tracking

## Phase 4: Optimization and Security

### Step 9: Database Optimization

#### 9.1 Performance Optimization
- Add appropriate database indexes
- Implement database connection pooling
- Optimize query patterns
- Add database query caching where appropriate

#### 9.2 Data Validation
- Implement server-side validation for all inputs
- Add file type and size validation
- Sanitize user inputs
- Validate foreign key relationships

### Step 10: Security Implementation

#### 10.1 Authentication & Authorization
- Implement middleware for route protection
- Add ownership validation for all resources
- Set up proper CORS policies
- Implement rate limiting per user

#### 10.2 File Security
- Validate uploaded file types thoroughly
- Implement virus scanning (optional but recommended)
- Set up signed URLs for audio file access
- Configure proper storage permissions

### Step 11: Error Handling and Logging

#### 11.1 Error Management
- Create centralized error handling middleware
- Implement proper HTTP status codes
- Add user-friendly error messages
- Set up error logging and monitoring

#### 11.2 Logging System
- Log API requests and responses
- Track processing times and failures
- Monitor Gemini API usage and costs
- Implement user activity logging

## Phase 5: Testing and Deployment Preparation

### Step 12: Testing Implementation

#### 12.1 API Testing
- Write unit tests for all API endpoints
- Test authentication and authorization
- Test file upload and processing flows
- Validate error handling scenarios

#### 12.2 Integration Testing
- Test Gemini API integration
- Test database operations
- Test file storage operations
- Test background job processing

### Step 13: Environment Configuration

#### 13.1 Environment Variables Setup
- Database connection strings
- Supabase configuration
- Google Gemini API keys
- Storage bucket configurations
- JWT secrets and keys

#### 13.2 Deployment Configuration
- Set up production database
- Configure production storage
- Set up monitoring and alerts
- Implement backup strategies

## Key Implementation Notes

1. **Error Handling**: Always implement comprehensive error handling at each step
2. **Rate Limiting**: Implement rate limiting for API calls to prevent abuse
3. **Caching**: Consider implementing caching for frequently accessed data
4. **Monitoring**: Set up logging and monitoring for all critical operations
5. **Scalability**: Design with future scaling in mind
6. **User Experience**: Provide real-time updates on processing status
7. **Data Privacy**: Ensure user data is properly protected and isolated
8. **Backup Strategy**: Implement regular backups for both database and storage

This guide provides the complete backend architecture for your Talkflo app. Each step should be implemented and tested thoroughly before moving to the next phase.