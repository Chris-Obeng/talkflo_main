"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Mic, Trash2, Copy, Image, Share2, Plus, FileText } from "lucide-react";

interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (noteId: number) => void;
  onDuplicate?: (noteId: number) => void;
  onAppendToNote?: (noteId: number) => void;
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

  // Handle opening animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    }
  }, [isOpen]);

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
    onAppendToNote?.(note.id);
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete?.(note.id);
      handleClose();
    }
  };

  const handleDuplicateClick = () => {
    onDuplicate?.(note.id);
  };

  const handleShareClick = () => {
    // Copy note content to clipboard
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    // You could show a toast notification here
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
            
            {/* Date */}
            <p className="text-gray-500 text-lg mb-6">
              {note.date}
            </p>

            {/* Horizontal Separator */}
            <div className="w-16 h-0.5 bg-orange-500 mx-auto mb-8"></div>
            </div>

            {/* Content Section */}
            <div className="px-8 pb-8">
            <div className="text-center mb-8">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            </div>

            {/* Append to Note Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={handleAppendClick}
                className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                <Mic className="w-5 h-5" />
                Append to note
              </button>
            </div>

            {/* Tags Section */}
            <div className="flex justify-center mb-8">
              <button className="flex items-center gap-2 border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 px-4 py-2 rounded-full transition-colors">
                <Plus className="w-4 h-4" />
                Add tags
              </button>
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

            {/* View Original Transcript Button */}
            <div className="flex justify-center pt-4 border-t border-gray-100">
              <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
                <FileText className="w-4 h-4" />
                View original transcript
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}