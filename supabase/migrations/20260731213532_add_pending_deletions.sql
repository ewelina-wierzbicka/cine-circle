-- Migration: add pending_deletions table for async avatar storage cleanup

CREATE TABLE IF NOT EXISTS public.pending_deletions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL,
  bucket_id   text        NOT NULL,
  object_path text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pending_deletions_user_id_idx ON public.pending_deletions (user_id);

-- Service role only — no authenticated user should read or write this table directly.
ALTER TABLE public.pending_deletions ENABLE ROW LEVEL SECURITY;
