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
  const [isDragOver, setIsDragOver] = useState(false);

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

  const processFile = async (file: File) => {
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    if (disabled || isUploading) return;

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      await processFile(file);
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
    <div className="space-y-2">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={supportedFormats.join(',')}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Upload Button with Drag & Drop */}
      {!selectedFile && !isUploading && (
        <div 
          className={`text-center border-2 border-dashed rounded-lg p-3 transition-all duration-200 ${
            isDragOver 
              ? 'border-orange-400 bg-orange-50' 
              : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-md transition-all duration-200 text-xs font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
          >
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Choose Audio File
            <div className="absolute inset-0 rounded-md bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
          <p className="mt-1.5 text-xs text-gray-500">
            Drag and drop or click to browse
          </p>
        </div>
      )}

      {/* Selected File Info */}
      {selectedFile && !isUploading && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-50/50 rounded-md p-2.5 border border-orange-200/50 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900 block truncate text-xs">{selectedFile.name}</span>
                <div className="text-xs text-gray-600 space-x-2">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  {selectedFile.duration && (
                    <span>{formatDuration(selectedFile.duration)}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleClearFile}
              className="ml-1.5 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200 flex-shrink-0"
              title="Remove file"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex gap-1.5">
            <button
              onClick={handleUpload}
              disabled={disabled}
              className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-sm transition-all duration-200 font-medium text-xs shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Start Upload
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="px-2 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-sm transition-all duration-200 font-medium text-xs shadow-sm hover:shadow-md"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-50/50 rounded-md p-2.5 border border-orange-200/50 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-900 truncate">
              Uploading {selectedFile?.name}...
            </span>
            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full ml-2">{uploadProgress}%</span>
          </div>
          
          <div className="w-full bg-orange-200/50 rounded-full h-1 mb-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-1 rounded-full transition-all duration-300 shadow-sm" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          
          <button
            onClick={() => setShowConfirmCancel(true)}
            className="text-orange-600 hover:text-orange-800 text-xs underline hover:no-underline transition-colors font-medium"
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