-- Migration: add itinerary column + update policy to conversations
-- Run in Supabase SQL editor

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS itinerary jsonb;

-- Allow users to update their own conversations (needed to persist itinerary edits)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'conversations'
      AND policyname = 'Users can update own conversations'
  ) THEN
    CREATE POLICY "Users can update own conversations"
      ON public.conversations FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;
