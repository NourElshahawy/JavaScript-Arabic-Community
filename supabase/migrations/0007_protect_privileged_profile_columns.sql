-- ============================================================================
-- Close a privilege-escalation gap on public.profiles.
--
-- "users update own profile" (0001_init_schema.sql) uses
-- `using (auth.uid() = id) with check (auth.uid() = id)` — that only checks
-- row ownership. Postgres RLS has no built-in column-level restriction, so
-- as written any signed-in user could call:
--   supabase.from('profiles').update({ role: 'admin' }).eq('id', auth.uid())
-- and it would succeed. This trigger closes that: for any UPDATE not
-- performed by an admin, it silently resets role/status/reputation back to
-- their previous values (a self-update to full_name/bio/etc. still goes
-- through untouched; only the privileged columns are protected).
-- ============================================================================

create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    new.role := old.role;
    new.status := old.status;
    new.reputation := old.reputation;
  end if;
  return new;
end;
$$;

create trigger protect_profile_privileged_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();
