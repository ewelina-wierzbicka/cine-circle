-- Migration: enforce avatar size and MIME type on the `avatar` bucket row
-- The 1 MB cap and the image allowlist lived only in handleAvatarChange, a
-- client handler. Uploads go browser-to-Storage with the user's own access
-- token, so a direct REST call bypassed both. Path RLS still confines writes to
-- the user's own folder; these two columns are the server-side size and type
-- check. Values mirror the client checks in
-- src/app/(app)/profile/ProfileContent.tsx. image/png stays in the list because
-- src/lib/resizeImage.ts returns the original file when the browser cannot
-- encode WebP.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatar',
  'avatar',
  false,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
