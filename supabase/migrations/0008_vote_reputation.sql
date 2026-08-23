-- ============================================================================
-- Award/revoke reputation when a question/answer/discussion receives a vote,
-- per spec: "Upvote received -> Reputation". Posts are excluded (no
-- downvote concept there; likes don't carry reputation in this design).
-- Self-votes never award reputation (RLS doesn't block voting on your own
-- content, so this is enforced here instead).
-- ============================================================================

create or replace function public.handle_vote_reputation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_id uuid := coalesce(new.content_id, old.content_id);
  target_type text := coalesce(new.content_type, old.content_type);
  voter_id uuid := coalesce(new.user_id, old.user_id);
  owner_id uuid;
  delta_up int := 0;
  delta_down int := 0;
  net_points int;
begin
  if target_type not in ('question', 'answer', 'discussion') then
    return null;
  end if;

  if tg_op = 'INSERT' then
    delta_up := case when new.value = 'up' then 1 else 0 end;
    delta_down := case when new.value = 'down' then 1 else 0 end;
  elsif tg_op = 'DELETE' then
    delta_up := case when old.value = 'up' then -1 else 0 end;
    delta_down := case when old.value = 'down' then -1 else 0 end;
  elsif tg_op = 'UPDATE' then
    delta_up := case when new.value = 'up' then 1 else 0 end - case when old.value = 'up' then 1 else 0 end;
    delta_down := case when new.value = 'down' then 1 else 0 end - case when old.value = 'down' then 1 else 0 end;
  end if;

  net_points := delta_up * 2 - delta_down * 1;
  if net_points = 0 then
    return null;
  end if;

  if target_type = 'question' then
    select author_id into owner_id from public.questions where id = target_id;
  elsif target_type = 'answer' then
    select author_id into owner_id from public.answers where id = target_id;
  elsif target_type = 'discussion' then
    select author_id into owner_id from public.discussions where id = target_id;
  end if;

  if owner_id is null or owner_id = voter_id then
    return null;
  end if;

  insert into public.reputation_events (user_id, event_type, points, content_type, content_id)
  values (owner_id, 'vote_received', net_points, target_type, target_id);

  return null;
end;
$$;

create trigger on_vote_reputation
  after insert or update or delete on public.votes
  for each row execute function public.handle_vote_reputation();
