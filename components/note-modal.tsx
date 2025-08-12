"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { X, Mic, Trash2, Copy, Image as ImageIcon, Share2, Plus, FileText, Tag, ChevronDown, ChevronUp, Wand2, Expand, Minimize } from "lucide-react";
import { Note, UITag, Tag as TagType } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (noteId: string) => void;
  onDuplicate?: (noteId: string) => void;
  onAppendToNote?: (noteId: string) => void;
  onAppendFileToNote?: (noteId: string) => void;
  onTagsUpdate?: (noteId: string, tags: UITag[]) => void;
  onNoteUpdate?: (noteId: string, updated: Partial<Note>) => void;
}

export function NoteModal({ 
  note, 
  isOpen, 
  onClose, 
  onDelete, 
  onDuplicate, 
  onAppendToNote, 
  onAppendFileToNote,
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
  // Auto-save refs and timers
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTitleRef = useRef<string>("");
  const lastSavedContentRef = useRef<string>("");
  // Cursor position ref
  const cursorPositionRef = useRef<number>(0);

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
      
      // Initialize last saved values
      lastSavedTitleRef.current = note?.title || "";
      lastSavedContentRef.current = note?.processed_content || note?.original_transcript || "";

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

  const handleAppendClick = () => {
    if (!note) return;
    handleClose(); // Close modal first
    setTimeout(() => {
      onAppendToNote?.(note.id); // Then trigger recording
    }, 100); // Small delay to allow modal close animation
  };

  const handleAppendFileClick = () => {
    if (!note) return;
    handleClose(); // Close modal first
    setTimeout(() => {
      onAppendFileToNote?.(note.id); // Then trigger file upload
    }, 100); // Small delay to allow modal close animation
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

  // Auto-save title with debouncing
  const autoSaveTitle = useCallback(async (titleToSave: string) => {
    if (!note) return;
    const trimmedTitle = titleToSave.trim();
    if (trimmedTitle === lastSavedTitleRef.current) return;
    
    setIsSavingTitle(true);
    // Optimistic update
    onNoteUpdate?.(note.id, { title: trimmedTitle });
    const ok = await apiClient.updateNote(note.id, { title: trimmedTitle });
    if (ok) {
      lastSavedTitleRef.current = trimmedTitle;
    } else {
      addToast({ type: 'error', title: 'Failed to save title' });
      // Revert
      onNoteUpdate?.(note.id, { title: lastSavedTitleRef.current });
      setLocalTitle(lastSavedTitleRef.current);
    }
    setIsSavingTitle(false);
  }, [note, onNoteUpdate, addToast]);

  // Save helpers for inline edits
  const saveTitle = useCallback(async () => {
    if (!note) return;
    const nextTitle = (localTitle || "").trim();
    if (nextTitle === lastSavedTitleRef.current) {
      setIsEditingTitle(false);
      return;
    }
    
    // Clear any pending auto-save
    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
      titleSaveTimeoutRef.current = null;
    }
    
    await autoSaveTitle(nextTitle);
    setIsEditingTitle(false);
  }, [note, localTitle, autoSaveTitle]);

  const cancelTitleEdit = useCallback(() => {
    if (!note) return;
    // Clear any pending auto-save
    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
      titleSaveTimeoutRef.current = null;
    }
    setLocalTitle(lastSavedTitleRef.current);
    setIsEditingTitle(false);
  }, [note]);

  // Auto-save content with debouncing
  const autoSaveContent = useCallback(async (contentToSave: string) => {
    if (!note) return;
    if (contentToSave === lastSavedContentRef.current) return;
    
    setIsSavingContent(true);
    // Optimistic UI updates both local render and parent list
    setRenderedContent(contentToSave);
    onNoteUpdate?.(note.id, { processed_content: contentToSave });
    const ok = await apiClient.updateNote(note.id, { processed_content: contentToSave });
    if (ok) {
      lastSavedContentRef.current = contentToSave;
    } else {
      addToast({ type: 'error', title: 'Failed to save content' });
      // Revert local render to previous
      setRenderedContent(lastSavedContentRef.current);
      onNoteUpdate?.(note.id, { processed_content: lastSavedContentRef.current });
      setLocalContent(lastSavedContentRef.current);
    }
    setIsSavingContent(false);
  }, [note, onNoteUpdate, addToast]);

  const saveContent = useCallback(async () => {
    if (!note) return;
    if (localContent === lastSavedContentRef.current) {
      setIsEditingContent(false);
      return;
    }
    
    // Clear any pending auto-save
    if (contentSaveTimeoutRef.current) {
      clearTimeout(contentSaveTimeoutRef.current);
      contentSaveTimeoutRef.current = null;
    }
    
    await autoSaveContent(localContent);
    setIsEditingContent(false);
  }, [note, localContent, autoSaveContent]);

  const cancelContentEdit = useCallback(() => {
    if (!note) return;
    // Clear any pending auto-save
    if (contentSaveTimeoutRef.current) {
      clearTimeout(contentSaveTimeoutRef.current);
      contentSaveTimeoutRef.current = null;
    }
    setLocalContent(lastSavedContentRef.current);
    setIsEditingContent(false);
  }, [note]);

  // Auto-save title when user stops typing (debounced)
  useEffect(() => {
    if (!isEditingTitle || !note) return;
    
    // Clear existing timeout
    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save
    titleSaveTimeoutRef.current = setTimeout(() => {
      const trimmedTitle = localTitle.trim();
      if (trimmedTitle !== lastSavedTitleRef.current) {
        autoSaveTitle(trimmedTitle);
      }
    }, 1000); // Save after 1 second of no typing
    
    return () => {
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }
    };
  }, [localTitle, isEditingTitle, note, autoSaveTitle]);

  // Auto-save content when user stops typing (debounced)
  useEffect(() => {
    if (!isEditingContent || !note) return;
    
    // Clear existing timeout
    if (contentSaveTimeoutRef.current) {
      clearTimeout(contentSaveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save
    contentSaveTimeoutRef.current = setTimeout(() => {
      if (localContent !== lastSavedContentRef.current) {
        autoSaveContent(localContent);
      }
    }, 1000); // Save after 1 second of no typing
    
    return () => {
      if (contentSaveTimeoutRef.current) {
        clearTimeout(contentSaveTimeoutRef.current);
      }
    };
  }, [localContent, isEditingContent, note, autoSaveContent]);

  // Auto-resize textarea when editing content starts
  useEffect(() => {
    if (isEditingContent) {
      const textarea = document.querySelector('textarea[data-content-editor="true"]') as HTMLTextAreaElement;
      if (textarea) {
        // Small delay to ensure the textarea is rendered
        setTimeout(() => {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        }, 0);
      }
    }
  }, [isEditingContent]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }
      if (contentSaveTimeoutRef.current) {
        clearTimeout(contentSaveTimeoutRef.current);
      }
    };
  }, []);

  // Safe guard after all hooks to preserve hook order
  if (!shouldRender || !note) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-y-auto flex items-start justify-center bg-black/60 transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      } ${isFullScreen ? 'p-0' : 'p-4'}`}
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div
        className={`relative w-full bg-white shadow-2xl transform transition-all duration-300 ease-in-out ${
          isClosing
            ? 'animate-out animate-collapse-up'
            : 'animate-in animate-collapse-down'
        } ${
          isFullScreen
            ? 'max-w-full min-h-screen rounded-t-3xl'
            : 'max-w-2xl my-8 rounded-3xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Close Button */}
          {isFullScreen ? (
            <button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-6 right-6 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Exit full screen"
            >
              <Minimize className="w-4 h-4 text-gray-600" />
            </button>
          ) : (
            <button
              onClick={() => setIsFullScreen(true)}
              className="absolute top-6 right-6 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Expand to full screen"
            >
              <Expand className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Rewrite Button (top-left) */}
          <button
            onClick={() => setShowRewrite((v) => !v)}
            className="absolute top-6 left-6 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 transition-colors"
            aria-label="Rewrite with AI"
            title="Rewrite with AI"
          >
            <Wand2 className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className={`${isFullScreen ? 'min-h-full flex flex-col' : ''}`}>
            {/* Header Section */}
            <div className={`px-8 pt-8 pb-6 text-center ${isFullScreen ? 'lg:px-32 bg-gradient-to-b from-orange-50/30 to-transparent' : ''}`}>
            {/* Title (inline editable) */}
            <div className="mb-4">
              <div className="relative inline-block w-full text-center">
                <h1
                  className={`text-3xl font-bold text-gray-900 leading-tight cursor-text hover:bg-orange-50 px-1 rounded transition-opacity duration-75 ${
                    isEditingTitle ? 'opacity-0' : 'opacity-100'
                  }`}
                  title="Click to edit title"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {isSavingTitle ? 'Saving…' : note.title}
                </h1>
                {isEditingTitle && (
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
                    onBlur={() => setIsEditingTitle(false)}
                    autoFocus
                    className="absolute top-0 left-0 w-full text-center text-3xl font-bold text-gray-900 leading-tight bg-transparent border-none focus:outline-none focus:ring-0 px-1 rounded"
                  />
                )}
              </div>
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
            <div className={`px-8 ${isFullScreen ? 'lg:px-32 flex-1 pb-0' : 'pb-8'}`}>
            <div className="text-center mb-6">
              <div className="relative w-full">
                <div
                  className={`text-gray-700 text-lg leading-relaxed whitespace-pre-wrap text-left cursor-text hover:bg-orange-50 rounded p-1 transition-opacity duration-75 ${
                    isEditingContent ? 'opacity-0' : 'opacity-100'
                  }`}
                  title="Click to edit content"
                  onClick={(e) => {
                    const currentDisplayed = renderedContent ?? note.processed_content ?? note.original_transcript ?? ''
                    setLocalContent(currentDisplayed)
                    
                    // Calculate approximate cursor position based on click location
                    const element = e.currentTarget;
                    const rect = element.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const clickY = e.clientY - rect.top;
                    
                    // Get text content and approximate position
                    const text = currentDisplayed;
                    const lines = text.split('\n');
                    
                    // Estimate line height (approximate)
                    const lineHeight = 28; // Based on text-lg and leading-relaxed
                    const clickedLine = Math.floor(clickY / lineHeight);
                    
                    let position = 0;
                    for (let i = 0; i < Math.min(clickedLine, lines.length - 1); i++) {
                      position += lines[i].length + 1; // +1 for newline
                    }
                    
                    // Estimate character position within the line
                    if (clickedLine < lines.length) {
                      const currentLine = lines[clickedLine] || '';
                      const charWidth = 9; // Approximate character width
                      const clickedChar = Math.floor(clickX / charWidth);
                      position += Math.min(clickedChar, currentLine.length);
                    }
                    
                    // Store the calculated position
                    cursorPositionRef.current = Math.max(0, Math.min(position, text.length));
                    
                    setIsEditingContent(true)
                  }}
                >
                  {isSavingContent
                    ? 'Saving…'
                    : (renderedContent ?? note.processed_content ?? note.original_transcript ?? 'No content available')}
                </div>
                {isEditingContent && (
                  <textarea
                    ref={(textarea) => {
                      if (textarea) {
                        // Focus and place cursor based on previously estimated position
                        textarea.focus();
                        const safePos = Math.max(0, Math.min(cursorPositionRef.current, textarea.value.length));
                        setTimeout(() => {
                          try {
                            textarea.setSelectionRange(safePos, safePos);
                          } catch {
                            // ignore selection errors
                          }
                        }, 0);
                      }
                    }}
                    data-content-editor="true"
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        saveContent();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelContentEdit();
                      }
                    }}
                    onBlur={() => setIsEditingContent(false)}
                    className="absolute top-0 left-0 w-full text-gray-700 text-lg leading-relaxed bg-transparent border-none focus:outline-none focus:ring-0 resize-none whitespace-pre-wrap p-1 rounded overflow-hidden"
                    style={{ 
                      height: 'auto',
                      minHeight: '1.5rem'
                    }}
                    onInput={(e) => {
                      // Auto-resize textarea to match content
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                  />
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
                  </div>
                )}
              </div>
            )}

            {/* Append to Note Buttons */}
            <div className={`flex justify-center gap-3 mb-8 ${isFullScreen ? 'hidden' : ''}`}>
              <button
                onClick={handleAppendClick}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                <Mic className="w-4 h-4" />
                Record & Append
              </button>
              <button
                onClick={handleAppendFileClick}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload & Append
              </button>
            </div>

            {/* Tags Section */}
            <div className={`mb-8 ${isFullScreen ? 'hidden' : ''}`}>
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

            {/* Action Buttons */}
            <div className={`flex justify-center gap-4 mb-6 ${isFullScreen ? 'hidden' : ''}`}>
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


            </div>

            {/* Full Screen Footer */}
            {isFullScreen && (
              <div className="mt-auto bg-gradient-to-t from-gray-50/80 to-transparent border-t border-gray-100/50 backdrop-blur-sm">
                <div className="px-8 lg:px-32 py-6">
                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={handleAppendClick}
                      className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Mic className="w-4 h-4" />
                      Record & Append
                    </button>
                    <button
                      onClick={handleAppendFileClick}
                      className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload & Append
                    </button>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteClick}
                        className="flex items-center justify-center w-11 h-11 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-105"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={handleDuplicateClick}
                        className="flex items-center justify-center w-11 h-11 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-105"
                        title="Duplicate note"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        className="flex items-center justify-center w-11 h-11 rounded-full bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-all duration-200 hover:scale-105"
                        title="Add image"
                        aria-label="Add image"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={handleShareClick}
                        className="flex items-center justify-center w-11 h-11 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700 transition-all duration-200 hover:scale-105"
                        title="Share/Export"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tags Section */}
                  <div className="flex flex-col items-center">
                    {tags.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mb-3">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-800 text-xs rounded-full shadow-sm"
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
                    )}
                    
                    <div className="flex items-center gap-2">
                      {showTagInput ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleTagInputKeyPress}
                            placeholder="Enter tag name"
                            className="px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                            autoFocus
                          />
                          <button
                            onClick={handleAddTag}
                            disabled={isSavingTag || !newTag.trim()}
                            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${isSavingTag || !newTag.trim() ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105'} text-white shadow-sm`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setShowTagInput(false);
                              setNewTag("");
                            }}
                            className="flex items-center justify-center w-9 h-9 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full transition-all duration-200 hover:scale-105 shadow-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowTagInput(true)}
                          className="flex items-center gap-2 border-2 border-dashed border-gray-300 hover:border-orange-400 text-gray-600 hover:text-orange-600 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add tags
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
