-- director is not rendered from stored media; detail pages fetch it live from TMDB.
ALTER TABLE "public"."media" DROP COLUMN IF EXISTS "director";
