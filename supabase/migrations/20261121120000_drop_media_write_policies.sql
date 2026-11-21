-- Migration: stop signed-in users writing shared media rows

-- media rows are shared by every user who saved that title. The old policies
-- allowed any INSERT and any UPDATE by any signed-in user, so one account could
-- rename a title or swap its poster for everybody, or plant a fake row before
-- anyone saved the real one. addUserMedia now writes the row through the
-- service role, from the cached TMDB detail on the server, so app users need
-- neither policy. With both gone RLS denies every write; SELECT stays.

DROP POLICY IF EXISTS "Enable update by authenticated users only" ON public.media;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.media;
