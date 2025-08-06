"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";

type RecordingState = 'idle' | 'uploading' | 'recording' | 'processing';

export interface RecordingWidgetRef {
  startRecording: () => void;
}

export const RecordingWidget = forwardRef<RecordingWidgetRef>((props, ref) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(1);

  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  // Mock upload progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === 'uploading') {
      interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 3) {
            setRecordingState('idle');
            return 1;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    setRecordingState('recording');
    setRecordingTime(0);
  };

  // Expose startRecording function to parent via ref
  useImperativeHandle(ref, () => ({
    startRecording,
  }));

  const stopRecording = () => {
    setRecordingState('uploading');
    setUploadProgress(1);
  };

  const cancelUpload = () => {
    setRecordingState('idle');
    setUploadProgress(1);
  };

  // Idle state - no widget shown (floating button handles this)
  if (recordingState === 'idle') {
    return null;
  }

  // Upload state (exactly like AudioPen)
  if (recordingState === 'uploading') {
    return (
      <div className="flex justify-center">
        <div className="bg-orange-500 rounded-3xl px-12 py-8 w-96 text-center text-white relative shadow-xl">
          {/* Loading dots */}
          <div className="flex justify-center mb-6 space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
          </div>
          
          {/* Upload text */}
          <div className="text-xl font-normal mb-8">
            ({uploadProgress}/3) uploading...
          </div>
          
          {/* Cancel link */}
          <button 
            onClick={cancelUpload}
            className="text-white underline hover:no-underline transition-all text-sm font-light"
          >
            cancel
          </button>
        </div>
      </div>
    );
  }

  // Recording state (exactly like AudioPen)
  if (recordingState === 'recording') {
    return (
      <div className="flex justify-center">
        <div className="bg-orange-500 rounded-3xl px-12 py-8 w-96 text-center text-white relative shadow-xl">
          {/* Timer */}
          <div className="text-3xl font-bold mb-6 tracking-wide">
            {formatTime(recordingTime)}
          </div>
          
          {/* Waveform visualization (exactly like AudioPen) */}
          <div className="flex justify-center items-end space-x-1 mb-8 h-20">
            {Array.from({ length: 45 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/80 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 60 + 15}px`,
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: `${0.8 + Math.random() * 0.4}s`
                }}
              />
            ))}
          </div>

          {/* Control buttons - positioned like AudioPen */}
          <div className="flex justify-between items-center px-4">
            {/* Refresh button */}
            <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            {/* Stop button */}
            <button 
              onClick={stopRecording}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg relative -mb-8"
            >
              <div className="w-5 h-5 bg-orange-500 rounded-sm"></div>
            </button>
            
            {/* Close button */}
            <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
});

RecordingWidget.displayName = "RecordingWidget";