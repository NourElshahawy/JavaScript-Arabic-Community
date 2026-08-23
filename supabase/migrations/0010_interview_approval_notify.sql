-- ============================================================================
-- Notify the author when their interview experience is approved. Reputation
-- for this content type is left unmodeled in the spec (unlike news), so
-- this only sends the notification, mirroring the approve/reject workflow
-- already in place for news.
-- ============================================================================

create or replace function public.handle_interview_approved()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    insert into public.notifications (user_id, type, content_type, content_id, message)
    values (new.author_id, 'interview_approved', 'interview_experience', new.id, 'تمت الموافقة على تجربة الانترفيو التي شاركتها');
  end if;

  return new;
end;
$$;

create trigger on_interview_approved
  after update of status on public.interview_experiences
  for each row execute function public.handle_interview_approved();
