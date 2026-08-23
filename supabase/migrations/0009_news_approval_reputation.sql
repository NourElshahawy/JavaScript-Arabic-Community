-- ============================================================================
-- Award reputation when a submitted news item is approved by an admin,
-- per spec: "News Approved -> Reputation". Also awards the "news-hunter"
-- badge on a submitter's first approved news item.
-- ============================================================================

create or replace function public.handle_news_approved()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  approved_count int;
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    insert into public.reputation_events (user_id, event_type, points, content_type, content_id)
    values (new.submitted_by, 'news_approved', 10, 'news', new.id);

    insert into public.notifications (user_id, type, content_type, content_id, message)
    values (new.submitted_by, 'news_approved', 'news', new.id, 'تمت الموافقة على الخبر الذي أرسلته');

    select count(*) into approved_count from public.news where submitted_by = new.submitted_by and status = 'approved';

    if approved_count = 1 then
      insert into public.user_badges (user_id, badge_id)
      select new.submitted_by, id from public.badges where slug = 'news-hunter'
      on conflict do nothing;
    end if;
  end if;

  return new;
end;
$$;

create trigger on_news_approved
  after update of status on public.news
  for each row execute function public.handle_news_approved();
