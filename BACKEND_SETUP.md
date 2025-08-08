# TalkFlo Backend Setup Guide

This guide will help you set up the complete backend for TalkFlo, including database schema, API routes, and Gemini integration.

## Prerequisites

1. **Supabase Project**: You need an active Supabase project
2. **Google Gemini API Access**: Get API key from Google AI Studio
3. **Node.js**: Version 18 or higher
4. **Next.js**: Version 15 or higher

## Quick Setup

### 1. Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Fill in the following variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`: Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)
- `GEMINI_API_KEY`: Your Google Gemini API key

### 2. Apply Database Migrations

Run the migration script to create all necessary tables and storage buckets:

```bash
npm run migrate
```

Or apply manually in the Supabase SQL editor by running each file in `supabase/migrations/` in order:

1. `001_create_notes_table.sql`
2. `002_create_tags_table.sql`  
3. `003_create_note_tags_table.sql`
4. `004_create_storage_bucket.sql`

### 3. Start the Development Server

```bash
npm run dev
```

## Database Schema

The backend includes the following tables:

### `notes` table
- Stores transcribed and processed notes
- Links to user via `user_id`
- Contains original transcript and processed content
- Tracks processing status and audio metadata

### `tags` table
- User-defined tags for organizing notes
- Each user has their own set of tags
- Optional color coding

### `note_tags` table
- Junction table for many-to-many relationship
- Links notes to multiple tags

### Storage
- `audio-files` bucket for storing user audio files
- Row-level security ensures users only access their files

## API Endpoints

### Audio Processing
- `POST /api/upload-audio` - Upload audio file and create note
- `POST /api/process-audio/[noteId]` - Process audio with Gemini

### Notes Management
- `GET /api/notes` - List notes with filtering and pagination
- `GET /api/notes/[id]` - Get single note with details
- `PUT /api/notes/[id]` - Update note title/content
- `DELETE /api/notes/[id]` - Delete note and associated files

### Tags Management
- `GET /api/tags` - List user's tags with usage counts
- `POST /api/tags` - Create new tag
- `PUT /api/tags/[id]` - Update tag
- `DELETE /api/tags/[id]` - Delete tag

### Note-Tag Relationships
- `POST /api/notes/[noteId]/tags` - Add tags to note
- `DELETE /api/notes/[noteId]/tags/[tagId]` - Remove tag from note

## Features

### Security
- Row Level Security (RLS) on all tables
- User isolation for all data
- Authentication required for all endpoints
- Rate limiting per user
- File type and size validation

### Audio Processing
- Supports MP3, WAV, M4A, AAC, OGG, WebM formats
- Maximum file size: 50MB
- Automatic transcription with Google Gemini Chirp
- Content rewriting and structuring with Gemini 2.5 Pro
- Auto-generated titles

### Data Management
- Automatic timestamps on all records
- Cascade deletes for data integrity
- Optimized database indexes
- Paginated API responses

## Error Handling

The backend includes comprehensive error handling:

- Authentication errors (401)
- Authorization errors (403) 
- Not found errors (404)
- Validation errors (400)
- Rate limit errors (429)
- Server errors (500)

All errors return structured JSON responses with descriptive messages.

## Rate Limiting

Default limits:
- 100 requests per minute per user
- Configurable via environment variables
- Automatic cleanup of tracking data

## Development

### Running Migrations
```bash
npm run migrate
```

### Testing API Endpoints
Use tools like Postman or curl to test endpoints. All endpoints require authentication via Supabase Auth.

### Monitoring
Check browser console and server logs for debugging information. The API includes detailed logging for all operations.

## Production Deployment

1. Set up production environment variables
2. Apply migrations to production database
3. Configure proper CORS settings
4. Set up monitoring and backup strategies
5. Implement CDN for audio file delivery (optional)

## Troubleshooting

### Common Issues

1. **Migration Errors**: Ensure you have service role key and proper permissions
2. **Gemini API Errors**: Verify API key and quota limits
3. **File Upload Issues**: Check storage bucket configuration and RLS policies
4. **Authentication Errors**: Verify Supabase client configuration

### Support

For issues with:
- Database: Check Supabase dashboard and logs
- API: Review server console logs
- Authentication: Verify middleware configuration
- File Storage: Check bucket policies and permissions

The backend is now fully functional and ready for integration with your frontend components!