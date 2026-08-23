-- ============================================================================
-- Two notification behaviors that were missing for comments:
--   1. The content owner (post author, discussion author, news submitter,
--      interview author) gets notified when someone comments on their
--      content — mirrors the existing "question answered" notification.
--   2. Any @username mentioned in a comment's body gets a "mention"
--      notification, per spec section 15 ("Someone mentioned you").
-- Both skip notifying the comment's own author.
-- ============================================================================

create or replace function public.handle_new_comment_notify()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  owner_id uuid;
  mentioned_username text;
  mentioned_user_id uuid;
begin
  if new.content_type = 'post' then
    select author_id into owner_id from public.posts where id = new.content_id;
  elsif new.content_type = 'discussion' then
    select author_id into owner_id from public.discussions where id = new.content_id;
  elsif new.content_type = 'news' then
    select submitted_by into owner_id from public.news where id = new.content_id;
  elsif new.content_type = 'interview_experience' then
    select author_id into owner_id from public.interview_experiences where id = new.content_id;
  end if;

  if owner_id is not null and owner_id <> new.author_id then
    insert into public.notifications (user_id, type, actor_id, content_type, content_id, message)
    values (owner_id, 'new_comment', new.author_id, new.content_type, new.content_id, 'علّق على المحتوى الخاص بك');
  end if;

  for mentioned_username in
    select distinct m[1] from regexp_matches(new.body, '@([a-zA-Z0-9_]{3,30})', 'g') as m
  loop
    select id into mentioned_user_id from public.profiles where username = mentioned_username;
    if mentioned_user_id is not null and mentioned_user_id <> new.author_id then
      insert into public.notifications (user_id, type, actor_id, content_type, content_id, message)
      values (mentioned_user_id, 'mention', new.author_id, new.content_type, new.content_id, 'أشار إليك في تعليق');
    end if;
  end loop;

  return new;
end;
$$;

create trigger on_new_comment_notify
  after insert on public.comments
  for each row execute function public.handle_new_comment_notify();
