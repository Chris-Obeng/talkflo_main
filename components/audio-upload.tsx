"use client";

import React, { useState, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface AudioUploadProps {
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (noteId: string) => void;
  onUploadError?: (error: string) => void;
  onUploadCancel?: () => void;
  appendToNoteId?: string;
  disabled?: boolean;
}

interface SelectedFile {
  file: File;
  name: string;
  size: number;
  duration?: number;
}

export function AudioUpload({
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onUploadCancel,
  appendToNoteId,
  disabled = false
}: AudioUploadProps) {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Supported audio formats
  const supportedFormats = [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/m4a',
    'audio/mp4',
    'audio/aac',
    'audio/ogg',
    'audio/webm',
    'audio/flac'
  ];

  // Client-side guidance only; direct-to-storage handles larger files, but we keep UX guardrails
  const maxFileSize = 200 * 1024 * 1024; // 200MB

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve(0); // Return 0 if duration can't be determined
      });
      
      audio.src = url;
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!supportedFormats.includes(file.type)) {
      const error = `Unsupported file format. Please select an audio file (MP3, WAV, M4A, etc.)`;
      addToast({
        type: 'error',
        title: 'Invalid File Format',
        description: error
      });
      onUploadError?.(error);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      const error = `File size too large. Maximum size is ${formatFileSize(maxFileSize)}`;
      addToast({
        type: 'error',
        title: 'File Too Large',
        description: error
      });
      onUploadError?.(error);
      return;
    }

    try {
      // Get audio duration
      const duration = await getAudioDuration(file);
      
      const selectedFile: SelectedFile = {
        file,
        name: file.name,
        size: file.size,
        duration: duration > 0 ? duration : undefined
      };

      setSelectedFile(selectedFile);
      
      addToast({
        type: 'info',
        title: 'File Selected',
        description: `${file.name} (${formatFileSize(file.size)}) ready to upload`
      });
    } catch (error) {
      console.error('Error processing file:', error);
      addToast({
        type: 'error',
        title: 'File Processing Error',
        description: 'Could not process the selected file'
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      onUploadStart?.();

      // Create abort controller
      const controller = new AbortController();
      setAbortController(controller);

      console.log('📤 Starting file upload:', selectedFile.name);
      
      const result = await apiClient.uploadAudio(
        selectedFile.file,
        selectedFile.name,
        appendToNoteId,
        controller.signal,
        (progress) => {
          setUploadProgress(progress);
          onUploadProgress?.(progress);
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('📤 File upload successful:', result.noteId);

      onUploadComplete?.(result.noteId!);
      
      // Reset state
      setSelectedFile(null);
      setIsUploading(false);
      setUploadProgress(0);
      setAbortController(null);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('📤 Upload error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      // Don't show error toast if upload was canceled
      if (errorMessage !== 'Upload canceled') {
        addToast({
          type: 'error',
          title: 'Upload Failed',
          description: errorMessage
        });
        onUploadError?.(errorMessage);
      }
      
      setIsUploading(false);
      setUploadProgress(0);
      setAbortController(null);
    }
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    
    setIsUploading(false);
    setUploadProgress(0);
    setSelectedFile(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    onUploadCancel?.();
    
    addToast({
      type: 'info',
      title: 'Upload Canceled',
      description: 'File upload has been canceled'
    });
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={supportedFormats.join(',')}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Upload Button */}
      {!selectedFile && !isUploading && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Audio
        </button>
      )}

      {/* Selected File Info */}
      {selectedFile && !isUploading && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span className="font-medium text-gray-900 truncate">{selectedFile.name}</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Size: {formatFileSize(selectedFile.size)}</div>
                {selectedFile.duration && (
                  <div>Duration: {formatDuration(selectedFile.duration)}</div>
                )}
              </div>
            </div>
            <button
              onClick={handleClearFile}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Remove file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleUpload}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Start Upload
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Choose Different File
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Uploading {selectedFile?.name}...
            </span>
            <span className="text-sm text-blue-700">{uploadProgress}%</span>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          
          <button
            onClick={() => setShowConfirmCancel(true)}
            className="text-blue-600 hover:text-blue-800 text-sm underline hover:no-underline transition-colors"
          >
            Cancel Upload
          </button>

          {showConfirmCancel && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm sm:w-80 shadow-xl text-left">
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
                    onClick={() => setShowConfirmCancel(false)}
                    className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Keep uploading
                  </button>
                  <button
                    onClick={() => { setShowConfirmCancel(false); handleCancel(); }}
                    className="px-3 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700"
                  >
                    Yes, cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}