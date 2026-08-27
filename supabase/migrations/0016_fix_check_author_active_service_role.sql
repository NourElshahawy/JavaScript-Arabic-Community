-- ============================================================================
-- check_author_active() (0013) blocks non-active accounts, but it also
-- unintentionally blocks anything inserted via the service_role key (admin
-- scripts, server-side jobs): auth.uid() is null outside a user session, so
-- `select status ... where id = null` finds no row, actor_status stays
-- null, and `null is distinct from 'active'` evaluates true - the insert
-- gets rejected. BYPASSRLS (which service_role has) only skips RLS policy
-- checks, not trigger execution, so this needed an explicit carve-out.
-- ============================================================================

create or replace function public.check_author_active()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  actor_status account_status;
begin
  if auth.uid() is null then
    -- No authenticated user in this context (service_role / admin script) -
    -- nothing to gate, since that path bypasses RLS entirely anyway.
    return new;
  end if;

  select status into actor_status from public.profiles where id = auth.uid();

  if actor_status is distinct from 'active' then
    raise exception 'Account is % and cannot perform this action', actor_status
      using errcode = '42501';
  end if;

  return new;
end;
$$;
