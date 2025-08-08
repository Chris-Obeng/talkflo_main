"use client";

import { RecordingWidget, RecordingWidgetRef } from "@/components/recording-widget";
import { NotesDashboard } from "@/components/notes-dashboard";

import { useState, useRef } from "react";
import type { Note } from "@/lib/types";

export function TalkfloMain() {
  const [recordingState, setRecordingState] = useState<'idle' | 'preparing' | 'recording' | 'uploading' | 'processing'>('idle');
  const recordingWidgetRef = useRef<RecordingWidgetRef>(null);
  // Keep a reference to the dashboard list API so we can
  // optimistically add/update notes without forcing remounts
  const dashboardApiRef = useRef<{
    addNote: (note: Note) => void;
    updateNote: (noteId: string, updated: Partial<Note>) => void;
    removeNote: (noteId: string) => void;
    refetch: () => Promise<void>;
  } | null>(null);

  const handleStartRecording = async () => {
    // Trigger the recording widget; widget will immediately show
    // a preparing state while it requests permissions
    recordingWidgetRef.current?.startRecording();
    setRecordingState('recording');
  };

  const handleAppendToNote = (noteId: string) => {
    // Start recording when appending to a note
    console.log('Appending to note:', noteId);
    handleStartRecording();
  };

  const handleRecordingStateChange = (state: 'idle' | 'preparing' | 'recording' | 'uploading' | 'processing') => {
    setRecordingState(state);
  };

  // Handle note creation: perform an optimistic insert so the new
  // processing note appears instantly without reloading the list
  const handleNoteCreated = (noteId: string) => {
    console.log('Note created:', noteId);
    const now = new Date().toISOString();
    const optimisticNote: Note = {
      id: noteId,
      user_id: 'current', // not used in UI
      title: 'Processing…',
      original_transcript: null,
      processed_content: null,
      audio_url: null,
      audio_duration: null,
      status: 'processing',
      error_message: null,
      created_at: now,
      updated_at: now,
      tags: [],
    };

    dashboardApiRef.current?.addNote(optimisticNote);
  };



  return (
    <div className="min-h-screen relative">
      {/* Main Content */}
      <div className="pt-12 pb-2 w-full max-w-none">
        {/* Main Branding - exactly like AudioPen */}
        <div className="text-center mb-12 mt-12">
          <h1 className="text-7xl font-serif text-gray-600 mb-3 tracking-tight font-normal">
            Talkflo
          </h1>
          <div className="w-12 h-0.5 bg-orange-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-500 font-light">
            Go from fuzzy thought to clear text. <em className="font-normal italic">Fast.</em>
          </p>
        </div>

        {/* Recording Widget - shows in center when active */}
        <div className="mb-12 flex justify-center">
          <RecordingWidget 
            ref={recordingWidgetRef} 
            onStateChange={handleRecordingStateChange}
            onNoteCreated={handleNoteCreated}
            onNoteUpdated={(note) => {
              // Push status/content updates from the poller into the list
              dashboardApiRef.current?.updateNote(note.id, note);
            }}
          />
        </div>

        {/* Notes Dashboard */}
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <NotesDashboard 
            onAppendToNote={handleAppendToNote}
            onReady={(api) => { dashboardApiRef.current = api; }}
          />
        </div>
      </div>

      {/* Floating Action Button - Bottom Middle (hide when recording, uploading, or processing) */}
      {recordingState === 'idle' && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={handleStartRecording}
            className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center group"
          >
            <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
