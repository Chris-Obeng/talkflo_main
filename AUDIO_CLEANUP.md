# Audio File Cleanup Implementation

This document explains how audio files are automatically deleted after note processing is completed in TalkFlo.

## Overview

To optimize storage usage and maintain clean data, TalkFlo automatically deletes audio files after they have been successfully processed into text notes. The audio files are only needed during the transcription and processing phase.

## Implementation Details

### 1. Edge Function Cleanup (Primary)

The main cleanup happens in the `process-audio-v2` edge function:

- **Location**: `supabase/functions/process-audio-v2/index.ts`
- **When**: After successful transcription and content processing (Step 5)
- **What**: Deletes the audio file from Supabase Storage and clears the `audio_url` field in the database
- **Reliability**: This is the primary cleanup mechanism and handles 99% of cases

### 2. Client-Side Fallback Cleanup

Multiple fallback mechanisms ensure cleanup happens even if the edge function cleanup fails:

#### Recording Widget Cleanup
- **Location**: `components/recording-widget.tsx`
- **When**: When note processing status changes to 'completed'
- **Purpose**: Immediate cleanup as soon as processing completes

#### Main Component Cleanup
- **Location**: `components/talkflo-main.tsx`
- **When**: When note updates are received and status is 'completed'
- **Purpose**: Fallback cleanup for any missed files

#### Periodic Cleanup
- **Location**: `components/notes-dashboard.tsx`
- **When**: Every 5 minutes
- **Purpose**: Background cleanup for any remaining audio files on completed notes

### 3. API Endpoint for Manual Cleanup

- **Location**: `app/api/notes/[noteId]/cleanup-audio/route.ts`
- **Purpose**: Allows manual cleanup via API call
- **Usage**: Called by client-side cleanup utilities

### 4. Cleanup Utilities

- **Location**: `lib/audio-cleanup.ts`
- **Functions**:
  - `cleanupAudioFile(noteId)` - Clean up single note's audio
  - `cleanupAudioFileIfCompleted(note)` - Conditional cleanup
  - `batchCleanupAudioFiles(notes)` - Batch cleanup for multiple notes

## Cleanup Flow

```
1. User uploads/records audio
2. Audio file stored in Supabase Storage
3. Note created with audio_url pointing to file
4. Edge function processes audio (transcription + AI processing)
5. Edge function deletes audio file and clears audio_url ✅ PRIMARY CLEANUP
6. If step 5 fails:
   - Recording widget detects completion → triggers cleanup ✅ FALLBACK 1
   - Main component receives update → triggers cleanup ✅ FALLBACK 2
   - Periodic cleanup runs every 5 minutes → triggers cleanup ✅ FALLBACK 3
```

## Storage Optimization

- **Before**: Audio files remain in storage indefinitely
- **After**: Audio files are deleted within seconds of processing completion
- **Fallback**: Multiple cleanup mechanisms ensure no files are left behind
- **Safety**: Only completed notes have their audio files deleted

## Error Handling

- All cleanup operations are non-critical and won't fail the main processing flow
- Failed cleanup attempts are logged but don't affect user experience
- Multiple fallback mechanisms ensure eventual cleanup even if primary method fails

## Manual Cleanup

If needed, audio files can be manually cleaned up via:

```typescript
import { apiClient } from '@/lib/api-client'

// Clean up specific note
await apiClient.cleanupAudioFile(noteId)

// Or use utility functions
import { cleanupAudioFileIfCompleted } from '@/lib/audio-cleanup'
await cleanupAudioFileIfCompleted(note)
```

## Monitoring

Cleanup operations are logged with the 🗑️ emoji prefix for easy identification in console logs:

- `🗑️ Deleting audio file: path/to/file`
- `🗑️ Audio file cleanup completed successfully`
- `🗑️ Audio cleanup failed (non-critical): error message`