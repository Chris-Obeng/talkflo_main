-- Create the note_tags junction table
-- Purpose: Many-to-many relationship between notes and tags

CREATE TABLE IF NOT EXISTS public.note_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create unique constraint to prevent duplicate note-tag relationships
CREATE UNIQUE INDEX IF NOT EXISTS idx_note_tags_unique ON public.note_tags(note_id, tag_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON public.note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON public.note_tags(tag_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access note-tag relationships for their own notes and tags
CREATE POLICY "Users can view own note-tag relationships" ON public.note_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own note-tag relationships" ON public.note_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM public.tags 
            WHERE tags.id = note_tags.tag_id AND tags.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own note-tag relationships" ON public.note_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
        )
    );