-- ============================================================================
-- 0001_init_schema.sql gave user_badges a public SELECT policy only, since
-- every award up to this point (accepted answer, news approved, first
-- question/answer, etc.) is granted via a security-definer trigger function
-- that bypasses RLS. The admin dashboard's manual "award badge" action
-- (for judgment-call badges like top-contributor) goes through the normal
-- client instead, so it needs an explicit admin-only INSERT/DELETE policy.
-- ============================================================================

create policy "admins award badges" on public.user_badges for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "admins revoke badges" on public.user_badges for delete to authenticated using (public.is_admin(auth.uid()));
