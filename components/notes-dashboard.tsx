"use client";

import React, { useCallback, useState } from "react";
import { NoteModal } from "./note-modal";
import { NoteSkeleton } from "./ui/note-skeleton";
import { Tag, Search } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Note } from "@/lib/types";
import { useNotes } from "@/lib/hooks/use-notes";
import { useToast } from "@/components/ui/toast";

interface NotesDashboardProps {
  onShowUpload?: () => void;
  onReady?: (api: {
    addNote: (note: Note) => void;
    upsertNote: (note: Note, placeAtTopIfNew?: boolean) => void;
    updateNote: (noteId: string, updated: Partial<Note>) => void;
    removeNote: (noteId: string) => void;
    refetch: () => Promise<void>;
    deleteSelected: () => void;
    clearSelection: () => void;
  }) => void;
  onSelectionChange?: (count: number) => void;
}

export function NotesDashboard({ onShowUpload, onReady, onSelectionChange }: NotesDashboardProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useToast();

  // Use standard client fetching for notes
  const { 
    notes, 
    isLoading: loading, 
    error: notesError, 
    refetch: loadNotes,
    addNote,
    upsertNote,
    updateNote,
    removeNote,
  } = useNotes({ 
        limit: 50 // Load most recent 50 notes
      });

  const error = notesError || '';

  const handleNoteClick = (note: Note, e: React.MouseEvent) => {
    const isCheckboxClick = !!(e.target as HTMLElement).closest('.note-checkbox');

    if (selectedNoteIds.length > 0) {
      // If selection mode is active, any click on the card toggles selection
      handleCheckboxChange(note.id, !selectedNoteIds.includes(note.id));
      return;
    }

    // If not in selection mode, only checkbox clicks should select
    if (isCheckboxClick) {
      handleCheckboxChange(note.id, !selectedNoteIds.includes(note.id));
      return;
    }

    // Otherwise, open the modal
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleCheckboxChange = (noteId: string, isChecked: boolean) => {
    setSelectedNoteIds(prev =>
      isChecked ? [...prev, noteId] : prev.filter(id => id !== noteId)
    );
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  React.useEffect(() => {
    onSelectionChange?.(selectedNoteIds.length);
  }, [selectedNoteIds, onSelectionChange]);

  // Keep the list in sync when modal updates tags, without refetching
  const handleTagsUpdate = (noteId: string, nextTags: Note['tags']) => {
    updateNote(noteId, { tags: nextTags || [] });
  };

  const handleDeleteNote = async (noteId: string) => {
    // Optimistic UI: remove immediately
    const deletedNote = notes.find((n) => n.id === noteId) || null;
    removeNote(noteId);
    if (selectedNote?.id === noteId) {
      setIsModalOpen(false);
      setSelectedNote(null);
    }

    try {
      const success = await apiClient.deleteNote(noteId);
      if (success) {
        addToast({ type: 'success', title: 'Note deleted' });
      } else {
        // Rollback on failure
        if (deletedNote) {
          upsertNote(deletedNote, true);
        }
        addToast({ type: 'error', title: 'Failed to delete note', description: 'Please try again.' });
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      if (deletedNote) {
        upsertNote(deletedNote, true);
      }
      addToast({ type: 'error', title: 'Error deleting note', description: 'Please try again.' });
    }
  };

  const handleDeleteSelected = useCallback(async () => {
    if (selectedNoteIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedNoteIds.length} selected notes?`)) {
      const originalNotes = [...notes];
      // Optimistic UI update
      // This is a bit of a hack, ideally useNotes would have a setNotes
      // For now, we'll just remove them one by one
      selectedNoteIds.forEach(id => removeNote(id));

      try {
        // In a real app, you'd have a bulk delete endpoint
        await Promise.all(selectedNoteIds.map(id => apiClient.deleteNote(id)));
        addToast({ type: 'success', title: `${selectedNoteIds.length} notes deleted` });
        setSelectedNoteIds([]);
      } catch (error) {
        console.error('Error deleting selected notes:', error);
        // Rollback
        originalNotes.forEach(note => upsertNote(note));
        addToast({ type: 'error', title: 'Failed to delete notes', description: 'Please try again.' });
      }
    }
  }, [selectedNoteIds, notes, removeNote, upsertNote, addToast]);

  const clearSelection = useCallback(() => {
    setSelectedNoteIds([]);
  }, []);

  const handleDuplicateNote = (noteId: string) => {
    // TODO: Implement note duplication
    console.log('Duplicate note:', noteId);
  };

  // Expose list manipulation API to parent so it can perform
  // optimistic inserts/updates without remounting the dashboard
  // (prevents the full "Loading your notes..." reload effect)
  React.useEffect(() => {
    onReady?.({
      addNote,
      upsertNote,
      // expose upsert as well for smooth insert at top
      updateNote,
      removeNote,
      refetch: loadNotes,
      deleteSelected: handleDeleteSelected,
      clearSelection: clearSelection,
    });
  }, [onReady, addNote, upsertNote, updateNote, removeNote, loadNotes, handleDeleteSelected, clearSelection]);

  // Periodic cleanup of audio files for completed notes
  React.useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      try {
        const completedNotesWithAudio = notes.filter(
          note => note.status === 'completed' && note.audio_url
        );
        
        if (completedNotesWithAudio.length > 0) {
          console.log(`🗑️ Periodic cleanup: found ${completedNotesWithAudio.length} completed notes with audio files`);
          const { batchCleanupAudioFiles } = await import('@/lib/audio-cleanup');
          await batchCleanupAudioFiles(completedNotesWithAudio);
        }
      } catch (error) {
        console.warn('🗑️ Periodic audio cleanup failed:', error);
      }
    }, 5 * 60 * 1000); // Run every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [notes]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Filter and sort notes based on search query
  const displayNotes = React.useMemo(() => {
    let filteredNotes = [...notes];
    
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredNotes = notes.filter((note) => {
        // Search in title
        const titleMatch = note.title.toLowerCase().includes(query);
        
        // Search in content
        const contentMatch = (note.processed_content || note.original_transcript || '')
          .toLowerCase()
          .includes(query);
        
        // Search in tags
        const tagMatch = note.tags?.some(tag => 
          tag.name.toLowerCase().includes(query)
        ) || false;
        
        return titleMatch || contentMatch || tagMatch;
      });
    }
    
    // Sort newest-first
    return filteredNotes.sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return bTime - aTime;
    });
  }, [notes, searchQuery]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        {/* Search Bar Skeleton */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <div 
              className="w-full h-12 rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              }}
            >
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          </div>
        </div>
        
        {/* Note Cards Skeleton */}
        <NoteSkeleton count={8} delay={300} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={loadNotes}
            className="text-orange-500 hover:text-orange-600 underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (notes.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No notes yet</h3>
          <p className="text-gray-500 mb-4">Start by recording your first audio note using the microphone button below.</p>
        </div>
      </div>
    );
  }

  // No search results state
  if (searchQuery.trim() && displayNotes.length === 0) {
    return (
      <div className="w-full">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notes, content, and tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
            
            {/* Upload Button */}
            <button
              onClick={onShowUpload}
              className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center group flex-shrink-0"
              title="Upload audio file"
            >
              <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* No results state */}
        <div className="flex justify-center items-center py-12">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No notes found</h3>
            <p className="text-gray-500 mb-4">
              No notes match your search for &quot;{searchQuery}&quot;. Try different keywords or check your spelling.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-orange-500 hover:text-orange-600 underline text-sm"
            >
              Clear search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notes, content, and tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:shadow-lg transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Upload Button */}
            <button
              onClick={onShowUpload}
              className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center group flex-shrink-0"
              title="Upload audio file"
            >
              <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
          </div>
          {searchQuery && (
            <p className="text-center text-sm text-gray-500 mt-3">
              {displayNotes.length} {displayNotes.length === 1 ? 'note' : 'notes'} found
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayNotes.map((note) => (
            <div
              key={note.id}
              onClick={(e) => handleNoteClick(note, e)}
              className={`relative bg-white hover:shadow-lg transition-all duration-300 cursor-pointer rounded-3xl p-8 group shadow-sm border flex flex-col min-h-[200px] ${selectedNoteIds.includes(note.id) ? 'border-orange-500' : 'border-gray-50'}`}
            >
              <div className="absolute bottom-4 right-4 note-checkbox">
                <div className="relative">
                  <input
                    type="radio"
                    name="note-selection"
                    className="sr-only"
                    checked={selectedNoteIds.includes(note.id)}
                    onChange={(e) => handleCheckboxChange(note.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()} // Prevent card click when clicking checkbox
                  />
                  <div 
                    className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                      selectedNoteIds.includes(note.id) 
                        ? 'border-orange-500 bg-orange-500' 
                        : 'border-gray-300 bg-gray-100 hover:border-gray-400'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckboxChange(note.id, !selectedNoteIds.includes(note.id));
                    }}
                  >
                    {selectedNoteIds.includes(note.id) && (
                      <div className="w-full h-full rounded-full bg-white scale-50 transition-transform duration-200" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Main content area - grows to fill available space */}
              <div className="flex-1 flex flex-col">
                {/* Status indicator for processing notes */}
                {note.status === 'processing' && (
                  <div className="flex items-center gap-2 mb-4 text-orange-600 text-sm">
                    <div className="w-3 h-3 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                    Processing...
                  </div>
                )}
                {note.status === 'failed' && (
                  <div className="flex items-center gap-2 mb-4 text-red-600 text-sm">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Processing failed
                  </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 leading-snug mb-4 group-hover:text-gray-900">
                  {note.title}
                </h3>
                
                {/* Content preview */}
                <p className="text-gray-600 text-base leading-relaxed mb-4 overflow-hidden line-clamp-4 flex-1">
                  {note.processed_content || note.original_transcript || 'Processing...'}
                </p>
                
                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-100"
                      >
                        <Tag className="w-3 h-3" />
                        {tag.name}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500 font-medium">
                        +{note.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Date - pinned to bottom */}
              <div className="mt-auto pt-2">
                <p className="text-gray-400 text-xs font-normal">
                  {formatDate(note.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note Modal */}
      <NoteModal
        note={selectedNote}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDelete={handleDeleteNote}
        onDuplicate={handleDuplicateNote}
        onTagsUpdate={handleTagsUpdate}
        onNoteUpdate={(id, updated) => updateNote(id, updated)}
      />
    </>
  );
}