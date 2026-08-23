-- ============================================================================
-- Suspend/ban was, until now, purely cosmetic: admins could flip
-- profiles.status, but nothing stopped a suspended/banned account from
-- still posting, answering, commenting, or voting — RLS insert policies
-- only ever checked "is this your own row", never account status. This
-- closes that with a single reusable BEFORE INSERT trigger.
-- ============================================================================

create or replace function public.check_author_active()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  actor_status account_status;
begin
  select status into actor_status from public.profiles where id = auth.uid();

  if actor_status is distinct from 'active' then
    raise exception 'Account is % and cannot perform this action', actor_status
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger check_author_active before insert on public.posts for each row execute function public.check_author_active();
create trigger check_author_active before insert on public.comments for each row execute function public.check_author_active();
create trigger check_author_active before insert on public.questions for each row execute function public.check_author_active();
create trigger check_author_active before insert on public.answers for each row execute function public.check_author_active();
create trigger check_author_active before insert on public.discussions for each row execute function public.check_author_active();
create trigger check_author_active before insert on public.news for each row execute function public.check_author_active();
create trigger check_author_active before insert on public.interview_experiences for each row execute function public.check_author_active();
create trigger check_author_active before insert on public.votes for each row execute function public.check_author_active();
