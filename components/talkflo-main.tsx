"use client";

import { RecordingWidget, RecordingWidgetRef } from "@/components/recording-widget";
import { NotesDashboard } from "@/components/notes-dashboard";
import { useState, useRef } from "react";

export function TalkfloMain() {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'uploading'>('idle');
  const recordingWidgetRef = useRef<RecordingWidgetRef>(null);

  const handleStartRecording = () => {
    setRecordingState('recording');
    // Trigger the recording widget via ref
    recordingWidgetRef.current?.startRecording();
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
          <RecordingWidget ref={recordingWidgetRef} />
        </div>

        {/* Notes Dashboard */}
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <NotesDashboard />
        </div>
      </div>

      {/* Floating Action Button - Bottom Middle (hide only when recording) */}
      {recordingState !== 'recording' && (
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
