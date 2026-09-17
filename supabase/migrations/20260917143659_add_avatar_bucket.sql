-- Migration: create the private `avatar` storage bucket
-- The bucket exists on the hosted project but was never captured in a migration,
-- so a fresh `supabase db reset` had no bucket for avatar uploads (breaks e2e).
-- RLS policies for bucket_id = 'avatar' already ship in 20260413175426_remote_schema.sql
-- ("Give users access to own folder 1bs1gex_0..3"), so only the bucket row is added here.
-- Private (public = false): the app serves avatars through signed URLs
-- (see getSignedAvatarUrl in src/services/updateProfile.ts), never public URLs.

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar', 'avatar', false)
ON CONFLICT (id) DO NOTHING;
