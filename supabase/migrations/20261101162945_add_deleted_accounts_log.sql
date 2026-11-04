-- Migration: add deleted_accounts, a log of erased account ids so a restore can re-apply deletions

-- Restoring a backup taken before an account deletion resurrects that account.
-- Nothing in the schema recorded that the deletion happened, so there was no list
-- of who to delete again. This table is that list. See docs/BACKUPS.md section 6.
--
-- Deliberately has NO foreign key to auth.users: the row has to outlive the user
-- it refers to, and a cascade would erase the record along with the account.

-- ---------------------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.deleted_accounts (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid         NOT NULL UNIQUE,
  deleted_at  timestamptz  NOT NULL DEFAULT now(),
  created_at  timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.deleted_accounts IS
  'Append-only log of erased auth.users ids. Holds a uuid and a timestamp, no personal data, so it is kept indefinitely. After restoring a backup, re-run the account deletion for every row newer than the backup.';

-- ---------------------------------------------------------------------------
-- 2. Indexes
-- ---------------------------------------------------------------------------

-- The only query this table serves: "who was deleted after this backup was taken".
CREATE INDEX IF NOT EXISTS deleted_accounts_deleted_at_idx
  ON public.deleted_accounts (deleted_at);

-- user_id is already indexed by its UNIQUE constraint. A uuid is never reused by
-- auth.users, so the constraint also makes the write idempotent across retries
-- and across a restore that brought the account back.

-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------

-- Enabled with no policies on purpose: that is deny-all for anon and
-- authenticated. Only the service role writes this table, and the service role
-- bypasses RLS. There is no per-user row here to grant access to, and exposing
-- the list would leak which accounts were erased and when.
ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;

-- Defence in depth, so the table stays closed even if a policy is added later by
-- mistake. RLS filters rows; this removes the table-level grant entirely.
REVOKE ALL ON public.deleted_accounts FROM anon, authenticated;
