"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { AudioRecorder } from "@/lib/audio-recorder";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useNoteProcessingStatus } from "@/lib/hooks/use-note";
import type { Note } from "@/lib/types";

type RecordingState = 'idle' | 'preparing' | 'uploading' | 'recording' | 'processing';

export interface RecordingWidgetRef {
  startRecording: () => void;
}

interface RecordingWidgetProps {
  onStateChange?: (state: RecordingState) => void;
  onNoteCreated?: (noteId: string) => void;
  onNoteUpdated?: (note: Note) => void;
}

export const RecordingWidget = forwardRef<RecordingWidgetRef, RecordingWidgetProps>(({ onStateChange, onNoteCreated, onNoteUpdated }, ref) => {
  const { addToast } = useToast();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  
  // Use standard client polling for note processing status
  const { note: processingNote, isCompleted, hasFailed, isProcessing } = useNoteProcessingStatus(currentNoteId);

  // Handle note processing updates
  useEffect(() => {
    if (!processingNote) return;

    // Propagate every server-fetched update to parent so the list item
    // gets fresh content/status without requiring a reload
    onNoteUpdated?.(processingNote);

    console.log('🔄 Note update:', processingNote.status, processingNote);

    if (isCompleted) {
      console.log('✅ Processing completed!', processingNote);
      addToast({
        type: 'success',
        title: 'Note Ready!',
        description: 'Your audio has been transcribed and enhanced'
      });
      setRecordingState('idle');
      setCurrentNoteId(null); // Stop monitoring this note
    } else if (hasFailed) {
      console.log('❌ Processing failed for note:', processingNote.id);
      const errorMsg = processingNote.error_message || 'Audio processing failed';
      setError(errorMsg);
      addToast({
        type: 'error',
        title: 'Processing Failed',
        description: errorMsg
      });
      setRecordingState('idle');
      setCurrentNoteId(null); // Stop monitoring this note
    } else if (isProcessing) {
      // Keep the processing state active
      if (recordingState !== 'processing') {
        setRecordingState('processing');
      }
    }
  }, [processingNote, isCompleted, hasFailed, isProcessing, recordingState, addToast, onNoteUpdated]);

  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setError('');
      console.log('🎤 Starting recording...');
      // Show the widget immediately while we request permission
      setRecordingState('preparing');
      
      // Check if audio recording is supported
      if (!AudioRecorder.isSupported()) {
        const errorMsg = 'Audio recording is not supported in your browser';
        setError(errorMsg);
        addToast({
          type: 'error',
          title: 'Recording Not Supported',
          description: errorMsg
        });
        setRecordingState('idle');
        return;
      }

      // Request permission and start recording
      console.log('🎤 Requesting microphone permission...');
      const hasPermission = await AudioRecorder.requestPermission();
      if (!hasPermission) {
        const errorMsg = 'Microphone permission denied';
        setError(errorMsg);
        addToast({
          type: 'error',
          title: 'Permission Denied',
          description: 'Please allow microphone access to record audio'
        });
        setRecordingState('idle');
        return;
      }

      // Set up audio recorder callbacks
      audioRecorder.setOnStop(async (audioBlob: Blob) => {
        console.log('🎤 Audio recorded, size:', audioBlob.size, 'bytes, type:', audioBlob.type);
        await handleAudioRecorded(audioBlob);
      });

      audioRecorder.setOnError((error: Error) => {
        console.error('🎤 Recording error:', error);
        const errorMsg = `Recording failed: ${error.message}`;
        setError(errorMsg);
        addToast({
          type: 'error',
          title: 'Recording Error',
          description: errorMsg
        });
        setRecordingState('idle');
      });

      // Start recording
      await audioRecorder.startRecording();
      setRecordingState('recording');
      setRecordingTime(0);
      console.log('🎤 Recording started successfully');
      
      addToast({
        type: 'info',
        title: 'Recording Started',
        description: 'Speak now, your audio is being recorded'
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start recording';
      console.error('🎤 Start recording error:', error);
      setError(errorMsg);
      addToast({
        type: 'error',
        title: 'Recording Failed',
        description: errorMsg
      });
      setRecordingState('idle');
    }
  };

  const handleAudioRecorded = async (audioBlob: Blob) => {
    try {
      console.log('📤 Starting upload process...');
      setRecordingState('uploading');
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload audio to backend
      console.log('📤 Uploading audio to backend...');
      const result = await apiClient.uploadAudio(audioBlob);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('📤 Upload result:', result);

      if (!result.success) {
        const errorMsg = result.error || 'Upload failed';
        console.error('📤 Upload failed:', errorMsg);
        setError(errorMsg);
        addToast({
          type: 'error',
          title: 'Upload Failed',
          description: errorMsg
        });
        setRecordingState('idle');
        return;
      }

      if (!result.noteId) {
        const errorMsg = 'No note ID returned from upload';
        console.error('📤 Upload error:', errorMsg);
        setError(errorMsg);
        addToast({
          type: 'error',
          title: 'Upload Error',
          description: errorMsg
        });
        setRecordingState('idle');
        return;
      }

      // Move to processing state
      console.log('🤖 Starting AI processing for note:', result.noteId);
      setRecordingState('processing');
      
      addToast({
        type: 'info',
        title: 'Processing Started',
        description: 'AI is transcribing and enhancing your audio...'
      });
      
      // Start monitoring for results
      console.log('🔄 Starting monitoring for note:', result.noteId);
      setCurrentNoteId(result.noteId);
      setRecordingState('processing');
      
      // Notify parent component that a note was created
      onNoteCreated?.(result.noteId);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      console.error('📤 Upload error:', error);
      setError(errorMsg);
      addToast({
        type: 'error',
        title: 'Upload Error',
        description: errorMsg
      });
      setRecordingState('idle');
    }
  };

  // Notify parent component of state changes
  React.useEffect(() => {
    onStateChange?.(recordingState);
  }, [recordingState, onStateChange]);

  // Expose startRecording function to parent via ref
  useImperativeHandle(ref, () => ({
    startRecording,
  }));

  const stopRecording = () => {
    if (audioRecorder.isRecording()) {
      audioRecorder.stopRecording();
    }
  };

  const cancelUpload = () => {
    setRecordingState('idle');
    setUploadProgress(0);
    setError('');
  };

  // Idle state - no widget shown (floating button handles this)
  if (recordingState === 'idle') {
    return null;
  }

  // Upload state
  if (recordingState === 'uploading') {
    return (
      <div className="flex justify-center">
        <div className="bg-orange-500 rounded-3xl px-12 py-8 w-96 text-center text-white relative shadow-xl">
          {/* Loading dots */}
          <div className="flex justify-center mb-6 space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
          </div>
          
          {/* Upload progress */}
          <div className="text-xl font-normal mb-4">
            Uploading... {uploadProgress}%
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-6">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="text-red-200 text-sm mb-4">{error}</div>
          )}
          
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

  // Preparing state (requesting permission)
  if (recordingState === 'preparing') {
    return (
      <div className="flex justify-center">
        <div className="bg-blue-500 rounded-3xl px-12 py-8 w-96 text-center text-white relative shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-xl font-normal mb-2">Preparing microphone…</div>
          <div className="text-sm text-white/80">Allow microphone access to start recording</div>
        </div>
      </div>
    );
  }

  // Processing state
  if (recordingState === 'processing') {
    return (
      <div className="flex justify-center">
        <div className="bg-blue-500 rounded-3xl px-12 py-8 w-96 text-center text-white relative shadow-xl">
          {/* Processing animation */}
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
          
          {/* Processing text */}
          <div className="text-xl font-normal mb-4">
            Processing with AI...
          </div>
          
          {/* Status */}
          <div className="text-sm text-white/80 mb-6">
            {processingNote?.status === 'processing' 
              ? 'Transcribing and rewriting your audio...'
              : 'Starting AI processing...'
            }
          </div>
          
          {/* Error message */}
          {error && (
            <div className="text-red-200 text-sm mb-4">{error}</div>
          )}
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

          {/* Error message if any */}
          {error && (
            <div className="text-red-200 text-sm mb-4 bg-red-500/20 rounded-lg p-2">
              {error}
            </div>
          )}

          {/* Control buttons - positioned like AudioPen */}
          <div className="flex justify-between items-center px-4">
            {/* Recording time instead of refresh button */}
            <div className="w-8 h-8 flex items-center justify-center text-xs text-white/70">
              {Math.floor(recordingTime / 60)}&apos;
            </div>
            
            {/* Stop button */}
            <button 
              onClick={stopRecording}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg relative -mb-8"
            >
              <div className="w-5 h-5 bg-orange-500 rounded-sm"></div>
            </button>
            
            {/* Cancel/Close button */}
            <button 
              onClick={() => {
                if (audioRecorder.isRecording()) {
                  audioRecorder.stopRecording();
                }
                setRecordingState('idle');
              }}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            >
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