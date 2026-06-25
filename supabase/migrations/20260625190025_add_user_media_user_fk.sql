-- Migration: add missing FK from user_media.user_id to auth.users with cascade delete

ALTER TABLE ONLY public.user_media
  ADD CONSTRAINT user_media_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
