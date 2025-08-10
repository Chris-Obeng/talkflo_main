"use client";

import { RecordingWidget, RecordingWidgetRef } from "@/components/recording-widget";
import { NotesDashboard } from "@/components/notes-dashboard";

import { useState, useRef } from "react";
import type { Note } from "@/lib/types";

export function TalkfloMain() {
  const [recordingState, setRecordingState] = useState<'idle' | 'preparing' | 'recording' | 'paused' | 'uploading' | 'processing' | 'file-uploading'>('idle');
  const [hasSelectedNotes, setHasSelectedNotes] = useState(false);
  const [appendToNoteId, setAppendToNoteId] = useState<string | undefined>(undefined);
  const appendToNoteIdRef = useRef<string | undefined>(undefined);
  const recordingWidgetRef = useRef<RecordingWidgetRef>(null);
  // Keep a reference to the dashboard list API so we can
  // optimistically add/update notes without forcing remounts
  const dashboardApiRef = useRef<{
    addNote: (note: Note) => void;
    upsertNote: (note: Note, placeAtTopIfNew?: boolean) => void;
    updateNote: (noteId: string, updated: Partial<Note>) => void;
    removeNote: (noteId: string) => void;
    refetch: () => Promise<void>;
  } | null>(null);
  const dashboardActionsRef = useRef<{
    deleteSelected: () => void;
    clearSelection: () => void;
  } | null>(null);

  const handleStartRecording = async () => {
    // Trigger the recording widget; widget will immediately show
    // a preparing state while it requests permissions
    recordingWidgetRef.current?.startRecording();
    setRecordingState('recording');
  };

  const handleShowUpload = () => {
    // Clear any append state for new uploads
    setAppendToNoteId(undefined);
    appendToNoteIdRef.current = undefined;
    recordingWidgetRef.current?.setAppendToNoteId(undefined);
    recordingWidgetRef.current?.showUploadDialog();
  };

  const handleAppendToNote = (noteId: string) => {
    // Set the note ID to append to and start recording
    console.log('🔗 handleAppendToNote called with noteId:', noteId);
    setAppendToNoteId(noteId);
    appendToNoteIdRef.current = noteId;
    // Also set it directly on the recording widget
    recordingWidgetRef.current?.setAppendToNoteId(noteId);
    console.log('🔗 appendToNoteId state and ref set to:', noteId);
    handleStartRecording();
  };

  const handleAppendFileToNote = (noteId: string) => {
    // Set the note ID to append to and show upload dialog
    console.log('🔗 handleAppendFileToNote called with noteId:', noteId);
    setAppendToNoteId(noteId);
    appendToNoteIdRef.current = noteId;
    // Also set it directly on the recording widget
    recordingWidgetRef.current?.setAppendToNoteId(noteId);
    console.log('🔗 appendToNoteId state and ref set to:', noteId);
    recordingWidgetRef.current?.showUploadDialog();
  };

  const handleRecordingStateChange = (state: 'idle' | 'preparing' | 'recording' | 'paused' | 'uploading' | 'processing' | 'file-uploading') => {
    setRecordingState(state);
    // Clear append note ID when recording is complete
    if (state === 'idle') {
      console.log('🔗 Clearing appendToNoteId on recording idle');
      setAppendToNoteId(undefined);
      appendToNoteIdRef.current = undefined;
    }
  };

  // Handle note creation: perform an optimistic insert so the new
  // processing note appears instantly without reloading the list
  const handleNoteCreated = (noteId: string) => {
    console.log('Note created:', noteId);
    // Do not insert a processing placeholder anymore.
    // The card will appear only when processing completes and content is ready.
  };



  return (
    <div className="min-h-screen relative">
      {/* Main Content */}
      <div className="pt-12 pb-2 w-full max-w-none">
        {/* Main Branding - exactly like AudioPen */}
        <div className="text-center mb-12 mt-12">
          <h1 className="text-5xl sm:text-6xl font-serif text-gray-600 mb-3 tracking-tight font-normal">
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
            appendToNoteId={appendToNoteId}
            onNoteUpdated={(note) => {
              console.log('🔄 Note updated in main component:', note.id, note.status);
              // Push status/content updates from the poller into the list
              if (note.status === 'completed') {
                // Insert the completed note smoothly at the top and ensure
                // we have the freshest version from the server if needed
                dashboardApiRef.current?.upsertNote(note, true);
              } else if (note.status === 'failed') {
                // No card until completed; ignore failed interim updates
              } else {
                // Still processing: keep dashboard unchanged
              }
            }}
          />
        </div>

        {/* Notes Dashboard */}
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <NotesDashboard 
            onAppendToNote={handleAppendToNote}
            onAppendFileToNote={handleAppendFileToNote}
            onReady={(api) => {
              dashboardApiRef.current = api;
              dashboardActionsRef.current = {
                deleteSelected: api.deleteSelected,
                clearSelection: api.clearSelection,
              };
            }}
            onSelectionChange={(count) => setHasSelectedNotes(count > 0)}
          />
        </div>
      </div>

      {/* Floating Action Buttons - Bottom Middle (hide when recording, uploading, or processing) */}
      {recordingState === 'idle' && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-300 ${hasSelectedNotes ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-3">
            {/* Upload Button */}
            <button
              onClick={handleShowUpload}
              className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
              tabIndex={hasSelectedNotes ? -1 : 0}
              title="Upload audio file"
            >
              <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
            
            {/* Record Button (Main) */}
            <button
              onClick={() => {
                console.log('🔗 Record button clicked - clearing append state');
                setAppendToNoteId(undefined); // Clear any append state for new recordings
                appendToNoteIdRef.current = undefined;
                recordingWidgetRef.current?.setAppendToNoteId(undefined);
                handleStartRecording();
              }}
              className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center group"
              tabIndex={hasSelectedNotes ? -1 : 0}
              title="Start recording"
            >
              <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Buttons for Selection */}
      {hasSelectedNotes && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-stone-200/50 p-2 flex gap-2">
            <button
              onClick={() => dashboardActionsRef.current?.deleteSelected()}
              className="group flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
            <button
              onClick={() => dashboardActionsRef.current?.clearSelection()}
              className="group flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-800 rounded-xl text-sm sm:text-base font-semibold border border-stone-300/50 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
