"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Mic, Trash2, Copy, Image, Share2, Plus, FileText, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { Note } from "@/lib/types";

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (noteId: string) => void;
  onDuplicate?: (noteId: string) => void;
  onAppendToNote?: (noteId: string) => void;
}

export function NoteModal({ 
  note, 
  isOpen, 
  onClose, 
  onDelete, 
  onDuplicate, 
  onAppendToNote 
}: NoteModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Handle opening animation and initialize tags
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setTags(note?.tags?.map(tag => tag.name) || []);
      setShowTagInput(false);
      setNewTag("");
      setShowTranscript(false);
    }
  }, [isOpen, note]);

  // Handle closing animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
      onClose();
    }, 300); // Match the animation duration
  }, [onClose]);

  // Close modal on escape key and manage scrolling
  useEffect(() => {
    if (!shouldRender) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    // Prevent background scrolling without causing layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = originalStyle.overflow;
    const originalPaddingRight = originalStyle.paddingRight;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${parseInt(originalPaddingRight) + scrollbarWidth}px`;

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [shouldRender, handleClose]);

  if (!shouldRender || !note) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleAppendClick = () => {
    handleClose(); // Close modal first
    setTimeout(() => {
      onAppendToNote?.(note.id); // Then trigger recording
    }, 100); // Small delay to allow modal close animation
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete?.(note.id);
      handleClose();
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowTagInput(false);
      setNewTag("");
    }
  };

  const handleDuplicateClick = () => {
    onDuplicate?.(note.id);
  };

  const handleShareClick = () => {
    // Copy note content to clipboard
    const content = note.processed_content || note.original_transcript || "";
    navigator.clipboard.writeText(`${note.title}\n\n${content}`);
    // You could show a toast notification here
  };

  const toggleTranscript = () => {
    setShowTranscript(!showTranscript);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-y-auto transition-all duration-300 ease-out ${
        isClosing 
          ? 'animate-out fade-out-0' 
          : 'animate-in fade-in-0'
      }`}
      style={{ 
        backgroundColor: isClosing 
          ? 'rgba(0, 0, 0, 0)' 
          : 'rgba(0, 0, 0, 0.6)'
      }}
      onClick={handleBackdropClick}
    >
      {/* Centering Container */}
      <div className="min-h-full flex items-center justify-center p-4">
        {/* Modal Container */}
        <div
          className={`relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl my-8 transform transition-all duration-300 ease-out ${
            isClosing 
              ? 'animate-out zoom-out-95 fade-out-0' 
              : 'animate-in zoom-in-95 fade-in-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Content */}
          <div>
            {/* Header Section */}
            <div className="px-8 pt-8 pb-6 text-center">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {note.title}
            </h1>

            {/* Status indicator */}
            {note.status === 'processing' && (
              <div className="flex items-center justify-center gap-2 mb-4 text-orange-600 bg-orange-50 rounded-lg p-3 mx-auto max-w-xs">
                <div className="w-4 h-4 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Processing with AI...</span>
              </div>
            )}
            
            {note.status === 'failed' && (
              <div className="flex items-center justify-center gap-2 mb-4 text-red-600 bg-red-50 rounded-lg p-3 mx-auto max-w-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Processing failed</span>
              </div>
            )}
            
            {/* Date */}
            <p className="text-gray-500 text-lg mb-6">
              {note.created_at ? new Date(note.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : ''}
            </p>

            {/* Horizontal Separator */}
            <div className="w-16 h-0.5 bg-orange-500 mx-auto mb-8"></div>
            </div>

            {/* Content Section */}
            <div className="px-8 pb-8">
            <div className="text-center mb-6">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {note.processed_content || note.original_transcript || "No content available"}
              </p>
            </div>

            {/* View Original Transcript Toggle */}
            {note.original_transcript && note.processed_content && (
              <div className="mb-6">
                <button
                  onClick={toggleTranscript}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors mx-auto"
                >
                  <FileText className="w-4 h-4" />
                  {showTranscript ? 'Hide original transcript' : 'View original transcript'}
                  {showTranscript ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                {/* Transcript Content */}
                {showTranscript && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Original Transcript:</h3>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {note.original_transcript}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Append to Note Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={handleAppendClick}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                <Mic className="w-4 h-4" />
                Append to note
              </button>
            </div>

            {/* Tags Section */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-orange-900 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                {showTagInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleTagInputKeyPress}
                      placeholder="Enter tag name"
                      className="px-3 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={handleAddTag}
                      className="flex items-center justify-center w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowTagInput(false);
                        setNewTag("");
                      }}
                      className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="flex items-center gap-2 border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 px-3 py-1.5 rounded-full text-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add tags
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={handleDeleteClick}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleDuplicateClick}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors"
                title="Duplicate note"
              >
                <Copy className="w-5 h-5" />
              </button>
              
              <button
                className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors"
                title="Add image"
                aria-label="Add image"
              >
                <Image className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleShareClick}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700 transition-colors"
                title="Share/Export"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}