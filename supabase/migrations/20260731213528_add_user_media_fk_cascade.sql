-- Migration: add FK user_media.user_id → auth.users(id) ON DELETE CASCADE

ALTER TABLE public.user_media
  DROP CONSTRAINT IF EXISTS user_media_user_id_fkey;

ALTER TABLE public.user_media
  ADD CONSTRAINT user_media_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
