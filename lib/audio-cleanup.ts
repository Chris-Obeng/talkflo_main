/**
 * Audio cleanup utilities for TalkFlo
 */

import { apiClient } from '@/lib/api-client'
import type { Note } from '@/lib/types'

/**
 * Clean up audio file for a completed note
 * This is a non-critical operation that runs in the background
 */
export async function cleanupAudioFile(noteId: string): Promise<void> {
  try {
    console.log('🗑️ Cleaning up audio file for note:', noteId);
    await apiClient.cleanupAudioFile(noteId);
    console.log('🗑️ Audio cleanup completed successfully');
  } catch (error) {
    console.warn('🗑️ Audio cleanup failed (non-critical):', error);
  }
}

/**
 * Clean up audio file for a note if it's completed and has an audio URL
 */
export async function cleanupAudioFileIfCompleted(note: Note): Promise<void> {
  if (note.status === 'completed' && note.audio_url) {
    await cleanupAudioFile(note.id);
  }
}

/**
 * Batch cleanup audio files for multiple completed notes
 */
export async function batchCleanupAudioFiles(notes: Note[]): Promise<void> {
  const completedNotesWithAudio = notes.filter(
    note => note.status === 'completed' && note.audio_url
  );

  if (completedNotesWithAudio.length === 0) {
    return;
  }

  console.log(`🗑️ Batch cleaning up ${completedNotesWithAudio.length} audio files`);

  // Clean up files in parallel but don't wait for all to complete
  const cleanupPromises = completedNotesWithAudio.map(note => 
    cleanupAudioFile(note.id)
  );

  // Use allSettled to not fail if some cleanups fail
  await Promise.allSettled(cleanupPromises);
}