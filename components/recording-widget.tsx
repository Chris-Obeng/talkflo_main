"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { AudioRecorder } from "@/lib/audio-recorder";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useNoteProcessingStatus } from "@/lib/hooks/use-note";
import { AudioVisualizer } from "@/components/audio-visualizer";
import { AudioUpload } from "@/components/audio-upload";
import type { Note } from "@/lib/types";

type RecordingState = 'idle' | 'uploading' | 'recording' | 'paused' | 'processing' | 'file-uploading';

export interface RecordingWidgetRef {
  startRecording: () => void;
  setAppendToNoteId: (noteId: string | undefined) => void;
  showUploadDialog: () => void;
}

interface RecordingWidgetProps {
  onStateChange?: (state: RecordingState) => void;
  onNoteCreated?: (noteId: string) => void;
  onNoteUpdated?: (note: Note) => void;
  onNoteProcessingCompleted?: (note: Note) => void;
  appendToNoteId?: string;
}

export const RecordingWidget = forwardRef<RecordingWidgetRef, RecordingWidgetProps>(({ onStateChange, onNoteCreated, onNoteUpdated, onNoteProcessingCompleted, appendToNoteId }, ref) => {
  console.log('🎤 RecordingWidget rendered with appendToNoteId:', appendToNoteId);
  
  // Recording time limit configuration (10 minutes = 600 seconds)
  const MAX_RECORDING_TIME = 600;
  const WARNING_TIME = 60; // Show warning when 1 minute left
  
  const appendToNoteIdRef = useRef<string | undefined>(appendToNoteId);
  const { addToast } = useToast();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(MAX_RECORDING_TIME);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showConfirmCancelRecording, setShowConfirmCancelRecording] = useState(false);
  const [showConfirmCancelUpload, setShowConfirmCancelUpload] = useState(false);
  const [showConfirmCancelFileUpload, setShowConfirmCancelFileUpload] = useState(false);
  
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
      
      // Clean up audio file after successful processing
      import('@/lib/audio-cleanup').then(({ cleanupAudioFileIfCompleted }) => {
        cleanupAudioFileIfCompleted(processingNote);
      });
      
      // Notify parent that processing is completed (for support modal)
      onNoteProcessingCompleted?.(processingNote);
      
      setRecordingState('idle');
      setCurrentNoteId(null); // Stop monitoring this note
    } else if (hasFailed) {
      console.log('❌ Processing failed for note:', processingNote.id);
      const errorMsg = processingNote.error_message || 'Audio processing failed';
      setError(errorMsg);
      // Attempt automatic fallback processing
      (async () => {
        try {
          const response = await fetch(`/api/process-audio/${processingNote.id}`, {
            method: 'POST',
            credentials: 'include'
          });
          if (response.ok) {
            setError('');
            addToast({
              type: 'info',
              title: 'Applied Fallback',
              description: 'Processing failed; added a placeholder note so you can continue.'
            });
            // Keep monitoring until completed
            setRecordingState('processing');
          } else {
            addToast({
              type: 'error',
              title: 'Processing Failed',
              description: 'Your audio was uploaded but processing failed. You can still access the audio file from your notes.'
            });
            setRecordingState('idle');
            setCurrentNoteId(null);
          }
        } catch {
          addToast({
            type: 'error',
            title: 'Processing Failed',
            description: 'Your audio was uploaded but processing failed. You can still access the audio file from your notes.'
          });
          setRecordingState('idle');
          setCurrentNoteId(null);
        }
      })();
    } else if (isProcessing) {
      // Keep the processing state active
      if (recordingState !== 'processing') {
        setRecordingState('processing');
      }
    }
  }, [processingNote, isCompleted, hasFailed, isProcessing, recordingState, addToast, onNoteUpdated, onNoteProcessingCompleted]);

  // Timer for recording with countdown and automatic stop at limit
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === 'recording' || recordingState === 'paused') {
      interval = setInterval(() => {
        // Get active recording time from AudioRecorder (excludes paused time)
        const activeTime = audioRecorder.getActiveRecordingDuration();
        const remainingTime = MAX_RECORDING_TIME - activeTime;
        setRecordingTime(Math.max(0, remainingTime));
        
        // Only check limits during active recording (not when paused)
        if (recordingState === 'recording') {
          // Show warning when 1 minute left
          if (remainingTime === WARNING_TIME) {
            addToast({
              type: 'warning',
              title: 'Recording Limit Warning',
              description: 'You have 1 minute remaining before automatic stop'
            });
          }
          
          // Auto-stop when limit reached
          if (remainingTime <= 0) {
            console.log('🎤 Maximum recording time reached, auto-stopping...');
            addToast({
              type: 'info',
              title: 'Recording Complete',
              description: 'Maximum recording time reached. Processing your audio...'
            });
            
            // Stop recording automatically
            if (audioRecorder.isRecording()) {
              audioRecorder.stopRecording();
            }
          }
        }
      }, 1000);
    } else if (recordingState === 'idle') {
      setRecordingTime(MAX_RECORDING_TIME);
    }
    
    return () => clearInterval(interval);
  }, [recordingState, audioRecorder, addToast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeWarningClass = (seconds: number) => {
    if (seconds <= WARNING_TIME) {
      return 'text-red-200 animate-pulse';
    }
    return '';
  };

  const startRecording = async () => {
    try {
      setError('');
      console.log('🎤 Starting recording...');
      // Show the widget immediately while we request permission
      
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
      setRecordingTime(MAX_RECORDING_TIME);
      console.log('🎤 Recording started successfully');
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

      // Create abort controller for upload cancellation
      const abortController = new AbortController();
      setUploadAbortController(abortController);

      // Upload audio to backend with real progress tracking
      const currentAppendToNoteId = appendToNoteIdRef.current;
      console.log('📤 Uploading audio to backend...', currentAppendToNoteId ? `appending to note: ${currentAppendToNoteId}` : 'creating new note');
      console.log('📤 appendToNoteId value from ref:', currentAppendToNoteId);
      
      const result = await apiClient.uploadAudio(
        audioBlob, 
        'recording.wav', 
        currentAppendToNoteId, 
        abortController.signal,
        (progress) => {
          // Real-time progress updates from XMLHttpRequest
          setUploadProgress(progress);
        }
      );
      
      // Clear abort controller after successful upload
      setUploadAbortController(null);
      
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
      
      // Start monitoring for results
      console.log('🔄 Starting monitoring for note:', result.noteId);
      setCurrentNoteId(result.noteId);
      setRecordingState('processing');
      
      // Notify parent component that a note was created
      onNoteCreated?.(result.noteId);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      console.error('📤 Upload error:', error);
      
      // Clear abort controller
      setUploadAbortController(null);
      
      // Don't show error toast if upload was canceled
      if (errorMsg !== 'Upload canceled') {
        setError(errorMsg);
        addToast({
          type: 'error',
          title: 'Upload Error',
          description: errorMsg
        });
      }
      setRecordingState('idle');
    }
  };

  // Notify parent component of state changes
  React.useEffect(() => {
    onStateChange?.(recordingState);
  }, [recordingState, onStateChange]);

  // Update ref when prop changes
  useEffect(() => {
    appendToNoteIdRef.current = appendToNoteId;
    console.log('🎤 appendToNoteIdRef updated to:', appendToNoteId);
  }, [appendToNoteId]);

  // Cleanup abort controller on unmount or state change
  useEffect(() => {
    return () => {
      if (uploadAbortController) {
        try {
          uploadAbortController.abort();
        } catch {
          // Ignore abort errors during cleanup
          console.log('📤 Upload aborted during cleanup (expected)');
        }
      }
    };
  }, [uploadAbortController]);

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    startRecording,
    setAppendToNoteId: (noteId: string | undefined) => {
      appendToNoteIdRef.current = noteId;
      console.log('🎤 appendToNoteIdRef set via ref to:', noteId);
    },
    showUploadDialog: () => {
      setShowUpload(true);
    },
  }));

  const stopRecording = () => {
    if (audioRecorder.isRecording() || audioRecorder.isPausedRecording()) {
      audioRecorder.stopRecording();
    }
  };

  const pauseRecording = () => {
    if (audioRecorder.isRecording()) {
      audioRecorder.pauseRecording();
      setRecordingState('paused');
    }
  };

  const resumeRecording = () => {
    if (audioRecorder.isPausedRecording()) {
      audioRecorder.resumeRecording();
      setRecordingState('recording');
    }
  };

  const cancelRecording = () => {
    if (audioRecorder.isRecording() || audioRecorder.isPausedRecording()) {
      audioRecorder.cancelRecording();
    }
    setRecordingState('idle');
    setRecordingTime(MAX_RECORDING_TIME);
    setError('');
  };

  const cancelUpload = () => {
    // Cancel the upload request if it's in progress
    if (uploadAbortController) {
      console.log('📤 Canceling upload...');
      try {
        uploadAbortController.abort();
      } catch {
        // Ignore abort errors as they're expected
        console.log('📤 Upload aborted (expected)');
      }
      setUploadAbortController(null);
    }
    
    setRecordingState('idle');
    setUploadProgress(0);
    setError('');
    
    addToast({
      type: 'info',
      title: 'Upload Canceled',
      description: 'Audio upload has been canceled'
    });
  };

  // File upload handlers
  const handleFileUploadStart = () => {
    console.log('📤 File upload started');
    setRecordingState('file-uploading');
    setUploadProgress(0);
  };

  const handleFileUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const handleFileUploadComplete = (noteId: string) => {
    console.log('📤 File upload completed:', noteId);
    setRecordingState('processing');
    setCurrentNoteId(noteId);
    setShowUpload(false);
    
    // Notify parent component that a note was created
    onNoteCreated?.(noteId);
  };

  const handleFileUploadError = (error: string) => {
    console.error('📤 File upload error:', error);
    setRecordingState('idle');
    setShowUpload(false);
  };

  const handleFileUploadCancel = () => {
    console.log('📤 File upload canceled');
    setRecordingState('idle');
    setShowUpload(false);
  };

  // Upload dialog state
  if (showUpload && recordingState === 'idle') {
    return (
      <div className="flex justify-center px-4">
        <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-3xl px-8 py-6 w-96 shadow-xl border border-orange-100 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/40 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-50/60 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Audio File</h3>
              <p className="text-xs text-gray-600">Choose an audio file to transcribe</p>
            </div>
            <button
              onClick={() => setShowUpload(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Upload area */}
          <div className="relative z-10">
            <AudioUpload
              onUploadStart={handleFileUploadStart}
              onUploadProgress={handleFileUploadProgress}
              onUploadComplete={handleFileUploadComplete}
              onUploadError={handleFileUploadError}
              onUploadCancel={handleFileUploadCancel}
              appendToNoteId={appendToNoteIdRef.current}
            />
          </div>
          
          {/* Footer info */}
          <div className="mt-4 pt-3 border-t border-orange-100/50 relative z-10">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Supports MP3, WAV, M4A and other audio formats</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // File uploading state
  if (recordingState === 'file-uploading') {
    return (
      <div className="flex justify-center px-4">
        <div className="bg-orange-500 rounded-3xl px-8 py-6 w-96 text-center text-white relative shadow-xl">
          {/* Loading dots */}
          <div className="flex justify-center mb-6 space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
          </div>
          
          {/* Upload progress */}
          <div className="text-xl font-normal mb-4">
            Uploading file... {uploadProgress}%
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
            onClick={() => setShowConfirmCancelFileUpload(true)}
            className="text-white underline hover:no-underline transition-all text-sm font-light"
          >
            cancel
          </button>

          {showConfirmCancelFileUpload && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86A2 2 0 0021 17.07L13.93 4.93a2 2 0 00-3.86 0L3 17.07A2 2 0 005.07 19z" />
                    </svg>
                  </div>
                  <h4 className="text-gray-900 font-semibold">Cancel file upload?</h4>
                </div>
                <p className="text-sm text-gray-600 mb-5">This will stop the current file upload and discard progress.</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowConfirmCancelFileUpload(false)}
                    className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Keep uploading
                  </button>
                  <button
                    onClick={() => { setShowConfirmCancelFileUpload(false); handleFileUploadCancel(); }}
                    className="px-3 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700"
                  >
                    Yes, cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Idle state - no widget shown (floating button handles this)
  if (recordingState === 'idle') {
    return null;
  }

  // Upload state
  if (recordingState === 'uploading') {
    return (
      <div className="flex justify-center px-4">
        <div className="bg-orange-500 rounded-3xl px-8 py-6 w-96 text-center text-white relative shadow-xl">
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
            onClick={() => setShowConfirmCancelUpload(true)}
            className="text-white underline hover:no-underline transition-all text-sm font-light"
          >
            cancel
          </button>

          {showConfirmCancelUpload && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86A2 2 0 0021 17.07L13.93 4.93a2 2 0 00-3.86 0L3 17.07A2 2 0 005.07 19z" />
                    </svg>
                  </div>
                  <h4 className="text-gray-900 font-semibold">Cancel upload?</h4>
                </div>
                <p className="text-sm text-gray-600 mb-5">This will stop the current upload and discard progress.</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowConfirmCancelUpload(false)}
                    className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Keep uploading
                  </button>
                  <button
                    onClick={() => { setShowConfirmCancelUpload(false); cancelUpload(); }}
                    className="px-3 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700"
                  >
                    Yes, cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Processing state
  if (recordingState === 'processing') {
    return (
      <div className="flex justify-center px-4">
        <div className="bg-orange-500 rounded-3xl px-8 py-6 w-96 text-center text-white relative shadow-xl">
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
          
          {/* Error message with retry option */}
          {error && (
            <div className="text-red-200 text-sm mb-4">
              <div className="mb-2">{error}</div>
              <button
                onClick={async () => {
                  if (currentNoteId) {
                    try {
                      const response = await fetch(`/api/process-audio/${currentNoteId}`, {
                        method: 'POST',
                        credentials: 'include'
                      })
                      if (response.ok) {
                        setError('')
                        addToast({
                          type: 'info',
                          title: 'Retry Started',
                          description: 'Attempting to process your audio again...'
                        })
                      }
                    } catch (err) {
                      console.error('Retry failed:', err)
                    }
                  }
                }}
                className="text-white underline hover:no-underline text-sm"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Recording state (with pause/resume functionality)
  if (recordingState === 'recording' || recordingState === 'paused') {
    const isRecording = recordingState === 'recording';
    
    return (
      <div className="flex justify-center px-4">
        <div className="bg-orange-500 rounded-3xl px-8 py-6 w-96 text-center text-white relative shadow-xl">
          {/* Countdown Timer */}
          <div className={`text-3xl font-bold mb-6 tracking-wide ${getTimeWarningClass(recordingTime)}`}>
            {formatTime(recordingTime)}
          </div>
          
          {/* Real-time waveform visualization */}
          <div className="mb-8">
            <AudioVisualizer
              audioStream={audioRecorder.getAudioStream()}
              isActive={isRecording}
              className="w-full"
            />
          </div>

          {/* Paused indicator */}
          {!isRecording && (
            <div className="text-white/80 text-sm mb-4">
              Recording paused
            </div>
          )}

          {/* Error message if any */}
          {error && (
            <div className="text-red-200 text-sm mb-4 bg-red-500/20 rounded-lg p-2">
              {error}
            </div>
          )}

          {/* Control buttons */}
          <div className="flex justify-between items-center px-4">
            {/* Pause/Resume button */}
            <button 
              onClick={isRecording ? pauseRecording : resumeRecording}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              title={isRecording ? "Pause recording" : "Resume recording"}
            >
              {isRecording ? (
                // Pause icon
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                // Play/Resume icon
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            
            {/* Stop button */}
            <button 
              onClick={stopRecording}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg relative -mb-8"
              title="Stop recording"
            >
              <div className="w-5 h-5 bg-orange-500 rounded-sm"></div>
            </button>
            
            {/* Cancel/Close button */}
            <button 
              onClick={() => setShowConfirmCancelRecording(true)}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              title="Cancel recording"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showConfirmCancelRecording && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86A2 2 0 0021 17.07L13.93 4.93a2 2 0 00-3.86 0L3 17.07A2 2 0 005.07 19z" />
                    </svg>
                  </div>
                  <h4 className="text-gray-900 font-semibold">Discard this recording?</h4>
                </div>
                <p className="text-sm text-gray-600 mb-5">If you cancel now, the current audio will be lost.</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowConfirmCancelRecording(false)}
                    className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Keep recording
                  </button>
                  <button
                    onClick={() => { setShowConfirmCancelRecording(false); cancelRecording(); }}
                    className="px-3 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700"
                  >
                    Yes, discard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
});

RecordingWidget.displayName = "RecordingWidget";
