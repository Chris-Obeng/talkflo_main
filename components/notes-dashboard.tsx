"use client";

import React, { useState } from "react";
import { NoteModal } from "./note-modal";
import { Tag } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Note } from "@/lib/types";
import { useNotes } from "@/lib/hooks/use-notes";
import { useToast } from "@/components/ui/toast";

interface NotesDashboardProps {
  onAppendToNote?: (noteId: string) => void;
  onReady?: (api: {
    addNote: (note: Note) => void;
    upsertNote: (note: Note, placeAtTopIfNew?: boolean) => void;
    updateNote: (noteId: string, updated: Partial<Note>) => void;
    removeNote: (noteId: string) => void;
    refetch: () => Promise<void>;
  }) => void;
}

export function NotesDashboard({ onAppendToNote, onReady }: NotesDashboardProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

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

  const handleDuplicateNote = (noteId: string) => {
    // TODO: Implement note duplication
    console.log('Duplicate note:', noteId);
  };

  const handleAppendToNote = (noteId: string) => {
    // Close modal and start recording
    handleCloseModal();
    onAppendToNote?.(noteId);
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
    });
  }, [onReady, addNote, upsertNote, updateNote, removeNote, loadNotes]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Ensure notes are displayed newest-first regardless of layout side-effects
  const displayNotes = React.useMemo(() => {
    return [...notes].sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return bTime - aTime;
    });
  }, [notes]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your notes...</p>
        </div>
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

  return (
    <>
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayNotes.map((note) => (
            <div
              key={note.id} 
              onClick={() => handleNoteClick(note)}
              className="bg-white hover:shadow-lg transition-all duration-300 cursor-pointer rounded-3xl p-8 group shadow-sm border border-gray-50"
            >
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
              <h3 className="text-xl font-bold text-gray-800 leading-snug mb-4 group-hover:text-gray-900">
                {note.title}
              </h3>
              
              {/* Content preview */}
              <p className="text-gray-600 text-base leading-relaxed mb-4 overflow-hidden line-clamp-4">
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
              
              {/* Date */}
              <p className="text-gray-400 text-sm font-normal">
                {formatDate(note.created_at)}
              </p>
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
        onAppendToNote={handleAppendToNote}
        onTagsUpdate={handleTagsUpdate}
        onNoteUpdate={(id, updated) => updateNote(id, updated)}
      />
    </>
  );
}