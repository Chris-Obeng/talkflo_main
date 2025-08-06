"use client";

import { useState } from "react";
import { NoteModal } from "./note-modal";

interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
}

const sampleNotes: Note[] = [
  {
    id: 1,
    title: "Living Normal Lives Documentary",
    content: "I'm going to show you how to live normal lives because I'm almost done with the documentary. I'm so proud right now. I can't even talk about church without mentioning Whitebeard from One Piece to a friend who hasn't watched it. Thank you.",
    date: "Jun 30, 2025"
  },
  {
    id: 2,
    title: "Appreciation for Your Viewership",
    content: "Thanks for watching.",
    date: "Jun 28, 2025"
  },
  {
    id: 3,
    title: "Appreciation for Viewing",
    content: "Thanks for watching!",
    date: "Jun 27, 2025"
  },
  {
    id: 4,
    title: "Apology and Request to Talk",
    content: "Hey, I want to talk to you. I'm sorry. I'm really sorry.",
    date: "Jun 27, 2025"
  },
  {
    id: 5,
    title: "Welcome Message",
    content: "Welcome, everyone!",
    date: "Jun 26, 2025"
  },
  {
    id: 6,
    title: "Decision Between Walmart and Borba",
    content: "I tell him it's an easy decision between Walmart and Borba.",
    date: "Jun 25, 2025"
  },
  {
    id: 7,
    title: "Reflections on Love and Relationships",
    content: "Love is a beautiful thing when you find the right person. Sometimes it takes time to understand what you really want in a relationship.",
    date: "Jun 24, 2025"
  },
  {
    id: 8,
    title: "Morning Routine Ideas",
    content: "Starting the day with meditation and a good cup of coffee really sets the tone for productivity. I've been experimenting with different morning routines.",
    date: "Jun 23, 2025"
  }
];

export function NotesDashboard() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = (noteId: number) => {
    // Implementation for deleting note
    console.log('Delete note:', noteId);
  };

  const handleDuplicateNote = (noteId: number) => {
    // Implementation for duplicating note
    console.log('Duplicate note:', noteId);
  };

  const handleAppendToNote = (noteId: number) => {
    // Implementation for appending to note (start recording)
    console.log('Append to note:', noteId);
  };

  return (
    <>
      <div className="w-full">
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {sampleNotes.map((note) => (
            <div
              key={note.id} 
              onClick={() => handleNoteClick(note)}
              className="bg-white hover:shadow-lg transition-all duration-300 cursor-pointer rounded-3xl p-8 group break-inside-avoid mb-6 shadow-sm border border-gray-50"
            >
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-800 leading-snug mb-4 group-hover:text-gray-900">
              {note.title}
            </h3>
            
            {/* Content preview */}
            <p className="text-gray-600 text-base leading-relaxed mb-6 overflow-hidden">
              {note.content}
            </p>
            
            {/* Date */}
            <p className="text-gray-400 text-sm font-normal">
              {note.date}
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
      />
    </>
  );
}