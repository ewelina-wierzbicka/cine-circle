-- Migration: add FK user_media.user_id → auth.users(id) ON DELETE CASCADE

ALTER TABLE public.user_media
  DROP CONSTRAINT IF EXISTS user_media_user_id_fkey;

-- Remove user_media rows whose user_id no longer exists in auth.users.
-- These orphans block the ADD CONSTRAINT below (SQLSTATE 23503).
DELETE FROM public.user_media um
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = um.user_id
  );

ALTER TABLE public.user_media
  ADD CONSTRAINT user_media_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
