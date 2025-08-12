"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { X, Trash2, Copy, Image as ImageIcon, Share2, Plus, FileText, Tag, ChevronDown, ChevronUp, Wand2, Maximize2 } from "lucide-react";
import { Note, UITag, Tag as TagType } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (noteId: string) => void;
  onDuplicate?: (noteId: string) => void;

  onTagsUpdate?: (noteId: string, tags: UITag[]) => void;
  onNoteUpdate?: (noteId: string, updated: Partial<Note>) => void;
}

export function NoteModal({ 
  note, 
  isOpen, 
  onClose, 
  onDelete, 
  onDuplicate, 

  onTagsUpdate,
  onNoteUpdate
}: NoteModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [tags, setTags] = useState<UITag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [isSavingTag, setIsSavingTag] = useState(false);
  const [showRewrite, setShowRewrite] = useState(false);
  const [rewriteText, setRewriteText] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [renderedContent, setRenderedContent] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  // Inline editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [localTitle, setLocalTitle] = useState<string>("");
  const [localContent, setLocalContent] = useState<string>("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const { addToast } = useToast();
  // Keep a ref of current tags to compute updates across async boundaries
  const tagsRef = useRef<UITag[]>([]);
  // Cursor position ref and textarea ref
  const cursorPositionRef = useRef<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Handle opening animation and initialize tags
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setTags(note?.tags || []);
      tagsRef.current = note?.tags || [];
      setShowTagInput(false);
      setNewTag("");
      setShowTranscript(false);
      setShowRewrite(false);
      setRewriteText("");
      setRenderedContent(null);
      setIsEditingTitle(false);
      setIsFullScreen(false);
      setIsEditingContent(false);
      setLocalTitle(note?.title || "");
      setLocalContent(note?.processed_content || note?.original_transcript || "");

      // Fetch all user tags so we can link existing tags or create new ones
      (async () => {
        try {
          const tagsFromServer = await apiClient.getTags();
          setAvailableTags(tagsFromServer || []);
        } catch {
          setAvailableTags([]);
        }
      })();
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

    // Prevent background scrolling
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = originalStyle.overflow;
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [shouldRender, handleClose]);

  // Do not early-return here to preserve Hooks order. We will guard before JSX return below.

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };



  const handleDeleteClick = () => {
    if (!note) return;
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete?.(note.id);
      handleClose();
    }
  };

  const handleAddTag = async () => {
    const name = newTag.trim();
    if (!name || isSavingTag || !note) return;

    // Prevent duplicate by name (case-insensitive compare on current note tags)
    const alreadyOnNote = tags.some(t => t.name.toLowerCase() === name.toLowerCase());
    if (alreadyOnNote) {
      setNewTag("");
      setShowTagInput(false);
      return;
    }

    try {
      setIsSavingTag(true);
      // Optimistically add a temporary tag for instant feedback
      const tempId = `temp-${Date.now()}`;
      const tempTag: UITag = { id: tempId, name };
      // Optimistically add and notify parent outside updater
      const optimistic = [...tagsRef.current, tempTag];
      setTags(optimistic);
      tagsRef.current = optimistic;
      onTagsUpdate?.(note.id, optimistic);
      // Clear input and hide quickly for snappy feel
      setNewTag("");

      // Check if tag already exists for user
      let tag = availableTags.find(t => t.name.toLowerCase() === name.toLowerCase());

      if (!tag) {
        // Create it first
        const created = await apiClient.createTag(name);
        if (!created) {
          // As a fallback, refetch tags in case it existed and API returned a conflict
          const refreshed = await apiClient.getTags();
          setAvailableTags(refreshed || []);
          tag = refreshed.find(t => t.name.toLowerCase() === name.toLowerCase());
          if (!tag) {
            throw new Error("Failed to create tag");
          }
        } else {
          tag = created;
          setAvailableTags(prev => [created!, ...prev]);
        }
      }

      // Link tag to note
      const linked = await apiClient.addTagsToNote(note.id, [tag.id]);
      if (!linked) {
        throw new Error("Failed to link tag to note");
      }

      // Replace temp tag with persisted tag
      const replaced = tagsRef.current.map(t => t.id === tempId ? { id: tag!.id, name: tag!.name, color: tag!.color ?? undefined } : t);
      setTags(replaced);
      tagsRef.current = replaced;
      // Inform parent so it can update the note list without a refetch
      onTagsUpdate?.(note.id, replaced);
      setShowTagInput(false);
    } catch (err) {
      console.error(err);
      // Revert optimistic add on failure
      const reverted = tagsRef.current.filter(t => !t.id.startsWith('temp-'));
      setTags(reverted);
      tagsRef.current = reverted;
      // Also inform parent to revert
      onTagsUpdate?.(note.id, reverted);
    } finally {
      setIsSavingTag(false);
    }
  };

  const handleRemoveTag = async (tagNameToRemove: string) => {
    if (!note) return;
    const tagToRemove = tags.find(t => t.name === tagNameToRemove);
    if (!tagToRemove) return;

    // Optimistic update
    const remaining = tagsRef.current.filter(t => t.id !== tagToRemove.id)
    setTags(remaining);
    tagsRef.current = remaining;
    try {
      await apiClient.removeTagFromNote(note.id, tagToRemove.id);
      onTagsUpdate?.(note.id, remaining);
    } catch (e) {
      console.error(e);
      // Revert on failure
      const reverted = [...tagsRef.current, tagToRemove];
      setTags(reverted);
      tagsRef.current = reverted;
    }
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
    if (!note) return;
    onDuplicate?.(note.id);
  };

  const handleShareClick = () => {
    if (!note) return;
    // Copy note content to clipboard
    const content = note.processed_content || note.original_transcript || "";
    navigator.clipboard.writeText(`${note.title}\n\n${content}`);
    // You could show a toast notification here
  };

  const handleCopyTranscript = useCallback(() => {
    if (!note?.original_transcript) return;
    navigator.clipboard.writeText(note.original_transcript);
  }, [note]);

  const handleCopyTranscriptAndNote = useCallback(() => {
    if (!note) return;
    const transcript = note.original_transcript ?? '';
    const content = (renderedContent ?? note.processed_content ?? '').trim();
    const titleBlock = note.title ? `${note.title}\n\n` : '';
    const combined = `${transcript}\n\n---\n\n${titleBlock}${content}`.trim();
    navigator.clipboard.writeText(combined);
  }, [note, renderedContent]);

  const toggleTranscript = () => {
    setShowTranscript(!showTranscript);
  };

  const handleRewrite = async () => {
    if (!note || !rewriteText.trim() || isRewriting) return;
    setIsRewriting(true);
    try {
      const res = await apiClient.rewriteNote(note.id, rewriteText.trim());
      if (!res.success || !res.note) {
        addToast({ type: 'error', title: 'Rewrite failed', description: res.error || 'Please try again.' });
        return;
      }
      // Update local render and parent list
      setRenderedContent(res.note.processed_content || res.note.original_transcript || "");
      onNoteUpdate?.(note.id, { processed_content: res.note.processed_content, status: res.note.status });
      addToast({ type: 'success', title: 'Note rewritten' });
      setShowRewrite(false);
    } catch {
      addToast({ type: 'error', title: 'Rewrite error', description: 'Please try again.' });
    } finally {
      setIsRewriting(false);
    }
  };

  // Save title function
  const saveTitle = useCallback(async () => {
    if (!note) return;
    const trimmedTitle = localTitle.trim();
    if (trimmedTitle === note.title) {
      setIsEditingTitle(false);
      return;
    }
    
    setIsSavingTitle(true);
    
    const ok = await apiClient.updateNote(note.id, { title: trimmedTitle });
    if (ok) {
      // Update parent component
      onNoteUpdate?.(note.id, { title: trimmedTitle });
      addToast({ type: 'success', title: 'Title saved' });
      setIsEditingTitle(false);
    } else {
      addToast({ type: 'error', title: 'Failed to save title' });
      // Revert to original title
      setLocalTitle(note.title);
    }
    setIsSavingTitle(false);
  }, [note, localTitle, onNoteUpdate, addToast]);

  const cancelTitleEdit = useCallback(() => {
    if (!note) return;
    setLocalTitle(note.title);
    setIsEditingTitle(false);
  }, [note]);

  // Save content function
  const saveContent = useCallback(async () => {
    if (!note) return;
    const currentContent = note.processed_content || note.original_transcript || "";
    if (localContent === currentContent) {
      setIsEditingContent(false);
      return;
    }
    
    setIsSavingContent(true);
    
    const ok = await apiClient.updateNote(note.id, { processed_content: localContent });
    if (ok) {
      // Update local render and parent component
      setRenderedContent(localContent);
      onNoteUpdate?.(note.id, { processed_content: localContent });
      addToast({ type: 'success', title: 'Content saved' });
      setIsEditingContent(false);
    } else {
      addToast({ type: 'error', title: 'Failed to save content' });
      // Revert to original content
      setLocalContent(currentContent);
    }
    setIsSavingContent(false);
  }, [note, localContent, onNoteUpdate, addToast]);

  const cancelContentEdit = useCallback(() => {
    if (!note) return;
    const currentContent = note.processed_content || note.original_transcript || "";
    setLocalContent(currentContent);
    setIsEditingContent(false);
  }, [note]);
 
 
 
  // Safe guard after all hooks to preserve hook order
  if (!shouldRender || !note) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black/60 transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      } ${isFullScreen ? 'p-0 overflow-hidden' : 'p-4 overflow-y-auto'}`}
      onClick={handleBackdropClick}
      style={{ 
        display: 'flex',
        alignItems: isFullScreen ? 'stretch' : 'flex-start',
        justifyContent: 'center',
        minHeight: '100vh',
        paddingTop: isFullScreen ? '0' : '2rem',
        paddingBottom: isFullScreen ? '0' : '2rem'
      }}
    >
      {/* Modal Container */}
      <div
        className={`relative w-full bg-white shadow-2xl ${
          isClosing
            ? 'animate-out animate-collapse-up'
            : 'animate-in animate-collapse-down'
        } ${
          isFullScreen
            ? 'max-w-full h-screen rounded-t-3xl overflow-hidden flex flex-col'
            : 'max-w-2xl my-8 rounded-3xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Close/Expand Button */}
          {isFullScreen ? (
            <button
              onClick={handleClose}
              className="absolute top-4 right-6 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          ) : (
            <button
              onClick={() => setIsFullScreen(true)}
              className="absolute top-4 right-6 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Expand to full screen"
            >
              <Maximize2 className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Rewrite Button (top-left) */}
          <button
            onClick={() => setShowRewrite((v) => !v)}
            className="absolute top-4 left-6 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 transition-colors"
            aria-label="Rewrite with AI"
            title="Rewrite with AI"
          >
            <Wand2 className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className={`${isFullScreen ? 'flex-1 flex flex-col overflow-hidden' : ''}`}>
            {/* Header Section */}
            <div className={`px-8 pt-8 pb-6 text-center ${isFullScreen ? 'lg:px-32 bg-gradient-to-b from-orange-50/30 to-transparent flex-shrink-0' : ''}`}>
            {/* Title (inline editable) */}
            <div className="mb-4">
              {!isEditingTitle ? (
                <h1
                  className="text-3xl font-bold text-gray-900 leading-tight cursor-text hover:bg-orange-50 px-2 py-1 rounded transition-colors duration-200 text-center"
                  title="Click to edit title"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {note.title}
                </h1>
              ) : (
                <div className="space-y-3">
                  <input
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        saveTitle();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelTitleEdit();
                      }
                    }}
                    autoFocus
                    className="w-full text-center text-3xl font-bold text-gray-900 leading-tight bg-white border border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 px-3 py-2 rounded-lg"
                    placeholder="Enter note title..."
                    style={{ minHeight: '3.5rem' }}
                  />
                  
                  {/* Save/Cancel Buttons */}
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={cancelTitleEdit}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveTitle}
                      disabled={isSavingTitle}
                      className={`px-4 py-2 text-sm text-white rounded-lg transition-colors flex items-center gap-2 ${
                        isSavingTitle 
                          ? 'bg-orange-400 cursor-not-allowed' 
                          : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                    >
                      {isSavingTitle && (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      )}
                      {isSavingTitle ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>

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
            
            {/* Rewrite Input */}
            {showRewrite && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">How should AI rewrite this note?</label>
                <textarea
                  value={rewriteText}
                  onChange={(e) => setRewriteText(e.target.value)}
                  placeholder="e.g., Summarize into bullet points, keep it concise and action-oriented"
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => setShowRewrite(false)}
                    className="px-4 py-2 rounded-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRewrite}
                    disabled={isRewriting || !rewriteText.trim()}
                    className={`px-4 py-2 rounded-full text-sm text-white ${isRewriting || !rewriteText.trim() ? 'bg-orange-300' : 'bg-orange-500 hover:bg-orange-600'} flex items-center gap-2`}
                  >
                    {isRewriting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    Rewrite with AI
                  </button>
                </div>
              </div>
            )}
            </div>

            {/* Content Section */}
            <div className={`px-8 ${isFullScreen ? 'lg:px-32 flex-1 overflow-y-auto pb-8' : 'pb-8'}`}>
            <div className="text-center mb-6">
              <div className="relative w-full">
                {!isEditingContent ? (
                  <div
                    className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap text-left cursor-text hover:bg-orange-50 rounded p-1 transition-colors duration-200"
                    title="Click to edit content"
                    onClick={() => {
                      const currentDisplayed = renderedContent ?? note.processed_content ?? note.original_transcript ?? ''
                      setLocalContent(currentDisplayed)
                      // Set cursor to end of text for consistent behavior
                      cursorPositionRef.current = currentDisplayed.length;
                      setIsEditingContent(true)
                    }}
                  >
                    {isSavingContent
                      ? 'Saving…'
                      : (renderedContent ?? note.processed_content ?? note.original_transcript ?? 'No content available')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      ref={(textarea) => {
                        textareaRef.current = textarea;
                        if (textarea && !textarea.dataset.initialized) {
                          // Mark as initialized to prevent re-initialization
                          textarea.dataset.initialized = 'true';
                          
                          // Set initial height
                          textarea.style.height = 'auto';
                          textarea.style.height = Math.max(textarea.scrollHeight, 120) + 'px';
                          
                          // Focus and place cursor at end - only once
                          textarea.focus();
                          const textLength = textarea.value.length;
                          textarea.setSelectionRange(textLength, textLength);
                        }
                      }}
                      data-content-editor="true"
                      value={localContent}
                      onChange={(e) => {
                        setLocalContent(e.target.value);
                      }}
                      onInput={(e) => {
                        // Use onInput for resize to avoid conflicts with onChange
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.max(target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          e.preventDefault();
                          saveContent();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelContentEdit();
                        }
                      }}
                      className="w-full text-gray-700 text-lg leading-relaxed bg-white border border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none whitespace-pre-wrap p-3 rounded-lg"
                      style={{ 
                        minHeight: '120px'
                      }}
                      placeholder="Start typing your content..."
                    />
                    
                    {/* Save/Cancel Buttons */}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelContentEdit}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveContent}
                        disabled={isSavingContent}
                        className={`px-4 py-2 text-sm text-white rounded-lg transition-colors flex items-center gap-2 ${
                          isSavingContent 
                            ? 'bg-orange-400 cursor-not-allowed' 
                            : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                      >
                        {isSavingContent && (
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                        )}
                        {isSavingContent ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={handleCopyTranscript}
                        className="text-orange-600 hover:text-orange-700 font-medium text-sm underline-offset-4 hover:underline flex items-center gap-1"
                        aria-label="Copy transcript"
                      >
                        <Copy className="w-4 h-4" />
                        Copy transcript
                      </button>
                      <button
                        onClick={handleCopyTranscriptAndNote}
                        className="text-orange-600 hover:text-orange-700 font-medium text-sm underline-offset-4 hover:underline flex items-center gap-1"
                        aria-label="Copy transcript and note"
                      >
                        Copy transcript + note
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}



            {/* Tags Section */}
            {!isFullScreen && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag.name)}
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
                      disabled={isSavingTag || !newTag.trim()}
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isSavingTag || !newTag.trim() ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'} text-white`}
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
            )}

            {/* Action Buttons */}
            {!isFullScreen && (
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
                <ImageIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleShareClick}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700 transition-colors"
                title="Share/Export"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            )}

            </div>


          </div>
        </div>
    </div>
  );
}
