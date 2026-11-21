-- Migration: stop signed-in users rewriting shared media rows

-- media rows are shared by every user who saved that title. The old policy
-- allowed any UPDATE by anyone, so one account could rename a title or swap its
-- poster for everybody. addUserMedia now inserts with ON CONFLICT DO NOTHING,
-- which needs no UPDATE policy, so the policy goes and UPDATE is denied.
-- ponytail: rows never refresh from TMDB now. Add a service-role refresh if stale titles show up.

DROP POLICY IF EXISTS "Enable update by authenticated users only" ON public.media;
