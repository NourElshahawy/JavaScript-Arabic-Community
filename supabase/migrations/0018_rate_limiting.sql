-- ============================================================================
-- Basic rate limiting on content creation, enforced in the database (not
-- just the UI) so it can't be bypassed by calling the API directly. Skips
-- the check when auth.uid() is null (service_role / admin scripts), same
-- carve-out as check_author_active() in 0016.
--
-- Limits are intentionally generous for normal use and tight for spam
-- bursts: a real person writing a few posts a minute is fine, a script
-- firing fifty inserts in a second is not.
-- ============================================================================

create or replace function public.check_rate_limit_author()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  window_start timestamptz;
  max_count int;
  recent_count int;
begin
  if auth.uid() is null then
    return new;
  end if;

  case tg_table_name
    when 'posts' then max_count := 5; window_start := now() - interval '5 minutes';
    when 'comments' then max_count := 10; window_start := now() - interval '5 minutes';
    when 'questions' then max_count := 3; window_start := now() - interval '10 minutes';
    when 'answers' then max_count := 10; window_start := now() - interval '5 minutes';
    when 'discussions' then max_count := 3; window_start := now() - interval '10 minutes';
    when 'interview_experiences' then max_count := 3; window_start := now() - interval '1 hour';
    else max_count := 20; window_start := now() - interval '5 minutes';
  end case;

  execute format('select count(*) from public.%I where author_id = $1 and created_at > $2', tg_table_name)
    into recent_count
    using new.author_id, window_start;

  if recent_count >= max_count then
    raise exception 'Rate limit exceeded: too many % in a short time, try again shortly', tg_table_name
      using errcode = '42901';
  end if;

  return new;
end;
$$;

create trigger check_rate_limit before insert on public.posts for each row execute function public.check_rate_limit_author();
create trigger check_rate_limit before insert on public.comments for each row execute function public.check_rate_limit_author();
create trigger check_rate_limit before insert on public.questions for each row execute function public.check_rate_limit_author();
create trigger check_rate_limit before insert on public.answers for each row execute function public.check_rate_limit_author();
create trigger check_rate_limit before insert on public.discussions for each row execute function public.check_rate_limit_author();
create trigger check_rate_limit before insert on public.interview_experiences for each row execute function public.check_rate_limit_author();

-- news uses submitted_by instead of author_id, so it gets its own tiny
-- function rather than complicating the one above with a column lookup.
create or replace function public.check_rate_limit_news()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  recent_count int;
begin
  if auth.uid() is null then
    return new;
  end if;

  select count(*) into recent_count
  from public.news
  where submitted_by = new.submitted_by and created_at > now() - interval '1 hour';

  if recent_count >= 3 then
    raise exception 'Rate limit exceeded: too many news submissions in a short time, try again shortly'
      using errcode = '42901';
  end if;

  return new;
end;
$$;

create trigger check_rate_limit before insert on public.news for each row execute function public.check_rate_limit_news();
