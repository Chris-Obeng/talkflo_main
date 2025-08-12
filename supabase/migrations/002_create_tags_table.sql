-- Create the tags table
-- Purpose: Store available tags for notes

CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7), -- hex color code like #FF5733
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create unique constraint on user_id + name (users can't have duplicate tag names)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_user_name_unique ON public.tags(user_id, name);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own tags
CREATE POLICY "Users can view own tags" ON public.tags
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" ON public.tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON public.tags
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON public.tags
    FOR DELETE USING (auth.uid() = user_id);