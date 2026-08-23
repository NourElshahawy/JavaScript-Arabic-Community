-- ============================================================================
-- Two notification bugs:
--   1. handle_new_follow / handle_new_answer / handle_answer_accepted_notify
--      (0001_init_schema.sql) stored their `message` in English ("started
--      following you", ...) even though the whole UI is Arabic. Replaced
--      with Arabic text, and answer_accepted now also records actor_id
--      (the question's author) so the UI can show who accepted it.
--   2. Liking a post never notified its author at all - there was a
--      reputation/count trigger for votes on questions/answers/discussions,
--      but nothing for posts. Added handle_post_like_notify.
-- ============================================================================

create or replace function public.handle_new_follow()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, actor_id, message)
  values (new.following_id, 'new_follower', new.follower_id, 'بدأ في متابعتك');
  return new;
end;
$$;

create or replace function public.handle_new_answer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  q_author uuid;
begin
  select author_id into q_author from public.questions where id = new.question_id;
  if q_author is not null and q_author <> new.author_id then
    insert into public.notifications (user_id, type, actor_id, content_type, content_id, message)
    values (q_author, 'question_answered', new.author_id, 'question', new.question_id, 'أجاب على سؤالك');
  end if;
  return new;
end;
$$;

create or replace function public.handle_answer_accepted_notify()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  q_author uuid;
begin
  if new.is_accepted = true and old.is_accepted = false then
    select author_id into q_author from public.questions where accepted_answer_id = new.id;
    insert into public.notifications (user_id, type, actor_id, content_type, content_id, message)
    values (new.author_id, 'answer_accepted', q_author, 'answer', new.id, 'تم قبول إجابتك');
  end if;
  return new;
end;
$$;

-- post likes -----------------------------------------------------------------
create or replace function public.handle_post_like_notify()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  post_author uuid;
begin
  if new.content_type = 'post' and new.value = 'up' then
    select author_id into post_author from public.posts where id = new.content_id;
    if post_author is not null and post_author <> new.user_id then
      insert into public.notifications (user_id, type, actor_id, content_type, content_id, message)
      values (post_author, 'like', new.user_id, 'post', new.content_id, 'أعجب بمنشورك');
    end if;
  end if;
  return new;
end;
$$;

create trigger on_post_like_notify
  after insert on public.votes
  for each row execute function public.handle_post_like_notify();
