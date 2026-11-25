-- Migration: bound user_media.review length and user_media.rating range

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.user_media'::regclass
      AND conname = 'user_media_review_length_check'
  ) THEN
    ALTER TABLE "public"."user_media"
      ADD CONSTRAINT "user_media_review_length_check"
      CHECK ("review" IS NULL OR length("review") <= 2000);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.user_media'::regclass
      AND conname = 'user_media_rating_range_check'
  ) THEN
    ALTER TABLE "public"."user_media"
      ADD CONSTRAINT "user_media_rating_range_check"
      CHECK ("rating" IS NULL OR ("rating" >= 0 AND "rating" <= 10));
  END IF;
END $$;
