-- ============================================================================
-- Grant table-level privileges to anon/authenticated.
--
-- Row Level Security only restricts WHICH rows a role can see/touch on a
-- table it already has a base GRANT on — it never substitutes for the
-- GRANT itself. 0001_init_schema.sql created every table and its RLS
-- policies but never issued the table-level GRANTs, so every query from
-- the `authenticated` (and `anon`) Postgres roles was being rejected with
-- "permission denied for table ..." before RLS ever ran, which is why
-- getCurrentUser() was failing to read `profiles`.
--
-- `anon` gets SELECT only (unauthenticated visitors can browse public
-- content; RLS still hides non-approved rows). `authenticated` gets full
-- CRUD verbs; RLS policies are what actually restrict a signed-in user to
-- their own rows / approved content.
-- ============================================================================

grant usage on schema public to anon, authenticated;

grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- Any table created by a future migration inherits the same grants
-- automatically, so this doesn't need to be repeated per-migration.
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
