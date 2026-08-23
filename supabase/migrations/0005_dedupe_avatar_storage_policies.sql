-- ============================================================================
-- Dedupe storage.objects policies on the "avatars" bucket.
--
-- 0003_storage.sql created the canonical set:
--   "avatar images are publicly readable"  (select)
--   "users upload their own avatar"        (insert)
--   "users update their own avatar"        (update)
--   "users delete their own avatar"        (delete)
--
-- A second, functionally identical set was later added by hand directly in
-- the Supabase dashboard, using slightly different names:
--   "avatars are publicly accessible"      (select)
--   "users upload own avatar"              (insert)
--   "users update own avatar"              (update)
--   "users delete own avatar"              (delete)
--
-- Having both means every avatar request is evaluated against duplicate
-- (but identical) policies. This drops the hand-added duplicates and keeps
-- the migration-tracked originals. IF EXISTS makes this safe to run even on
-- a database where the duplicates were never created.
-- ============================================================================

drop policy if exists "avatars are publicly accessible" on storage.objects;
drop policy if exists "users upload own avatar" on storage.objects;
drop policy if exists "users update own avatar" on storage.objects;
drop policy if exists "users delete own avatar" on storage.objects;
