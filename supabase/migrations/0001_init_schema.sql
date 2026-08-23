-- ============================================================================
-- JavaScript Arabic Community — Initial schema
--
-- Design notes:
--   * Tagging is polymorphic (content_tags) instead of one join table per
--     content type (post_tags/question_tags/news_tags/...), so new taggable
--     content types don't need new tables.
--   * Voting is polymorphic (votes) and covers posts/questions/answers/
--     discussions with a single unique(user, content) constraint, which is
--     what actually prevents double-voting (spec §11/§23).
--   * Comments are polymorphic (comments) and support one level of replies
--     via parent_comment_id, covering posts/discussions/news/interview
--     experiences. Questions use dedicated `answers` instead of comments,
--     since answers carry extra state (accepted flag).
--   * Every moderated content type (posts, discussions, questions, news,
--     interview_experiences) carries a `status content_status` column.
--     Only 'approved' rows are visible to normal users (spec §21).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type content_status as enum ('pending', 'approved', 'rejected', 'deleted');
create type user_role as enum ('member', 'moderator', 'admin');
create type account_status as enum ('active', 'suspended', 'banned');
create type vote_value as enum ('up', 'down');
create type experience_level as enum ('intern', 'junior', 'mid', 'senior', 'lead');
create type interview_difficulty as enum ('easy', 'medium', 'hard');
create type report_reason as enum ('spam', 'harassment', 'offensive', 'fake_information', 'copyright', 'other');
create type report_status as enum ('pending', 'reviewed', 'actioned', 'dismissed');

-- content_type is used across votes / comments / bookmarks / reports / content_tags
-- as a polymorphic discriminator. Kept as text with a check constraint (not an
-- enum) on each table so new content types can be added without an enum migration.

-- ----------------------------------------------------------------------------
-- profiles — extends auth.users (1:1, id shared with auth.users.id)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null,
  avatar_url text,
  bio text,
  location text,
  github_url text,
  linkedin_url text,
  website_url text,
  skills text[] not null default '{}',
  reputation integer not null default 0,
  role user_role not null default 'member',
  status account_status not null default 'active',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]{3,30}$')
);

create index profiles_username_trgm_idx on public.profiles using gin (username gin_trgm_ops);
create index profiles_full_name_trgm_idx on public.profiles using gin (full_name gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- tags
-- ----------------------------------------------------------------------------
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  usage_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index tags_name_trgm_idx on public.tags using gin (name gin_trgm_ops);

-- Polymorphic tag assignment: works for posts, questions, discussions, news,
-- interview_experiences without a join table per content type.
create table public.content_tags (
  tag_id uuid not null references public.tags(id) on delete cascade,
  content_type text not null check (content_type in ('post', 'question', 'discussion', 'news', 'interview_experience')),
  content_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (content_type, content_id, tag_id)
);

create index content_tags_lookup_idx on public.content_tags (content_type, content_id);
create index content_tags_tag_idx on public.content_tags (tag_id);

-- ----------------------------------------------------------------------------
-- follows — user follows user
-- ----------------------------------------------------------------------------
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create index follows_following_idx on public.follows (following_id);

-- ----------------------------------------------------------------------------
-- posts — general feed posts / project showcases
-- ----------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  images text[] not null default '{}',
  status content_status not null default 'approved',
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint body_not_empty check (char_length(btrim(body)) > 0)
);

create index posts_author_idx on public.posts (author_id);
create index posts_status_created_idx on public.posts (status, created_at desc);
create index posts_body_trgm_idx on public.posts using gin (body gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- discussions — open-ended topics (not seeking a single answer)
-- ----------------------------------------------------------------------------
create table public.discussions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  status content_status not null default 'approved',
  upvotes_count integer not null default 0,
  downvotes_count integer not null default 0,
  comments_count integer not null default 0,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint title_len check (char_length(btrim(title)) between 5 and 300)
);

create index discussions_author_idx on public.discussions (author_id);
create index discussions_status_created_idx on public.discussions (status, created_at desc);
create index discussions_search_idx on public.discussions using gin (to_tsvector('simple', title || ' ' || body));

create table public.discussion_follows (
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (discussion_id, user_id)
);

-- ----------------------------------------------------------------------------
-- questions & answers
-- ----------------------------------------------------------------------------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  status content_status not null default 'approved',
  accepted_answer_id uuid,
  upvotes_count integer not null default 0,
  downvotes_count integer not null default 0,
  answers_count integer not null default 0,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint title_len check (char_length(btrim(title)) between 10 and 300)
);

create index questions_author_idx on public.questions (author_id);
create index questions_status_created_idx on public.questions (status, created_at desc);
create index questions_search_idx on public.questions using gin (to_tsvector('simple', title || ' ' || body));

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  is_accepted boolean not null default false,
  upvotes_count integer not null default 0,
  downvotes_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint body_not_empty check (char_length(btrim(body)) > 0)
);

create index answers_question_idx on public.answers (question_id);
create index answers_author_idx on public.answers (author_id);

alter table public.questions
  add constraint questions_accepted_answer_fk
  foreign key (accepted_answer_id) references public.answers(id) on delete set null;

-- ----------------------------------------------------------------------------
-- comments — polymorphic, one reply level (posts, discussions, news, interviews)
-- ----------------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('post', 'discussion', 'news', 'interview_experience')),
  content_id uuid not null,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  body text not null,
  likes_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint body_not_empty check (char_length(btrim(body)) > 0)
);

create index comments_lookup_idx on public.comments (content_type, content_id, created_at);
create index comments_parent_idx on public.comments (parent_comment_id);
create index comments_author_idx on public.comments (author_id);

-- ----------------------------------------------------------------------------
-- votes — polymorphic up/down vote, one per user per content item
-- ----------------------------------------------------------------------------
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('post', 'question', 'answer', 'discussion')),
  content_id uuid not null,
  value vote_value not null,
  created_at timestamptz not null default now(),
  unique (user_id, content_type, content_id)
);

create index votes_lookup_idx on public.votes (content_type, content_id);

-- ----------------------------------------------------------------------------
-- news — submitted, reviewed by admin before publish
-- ----------------------------------------------------------------------------
create table public.news (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  summary text not null,
  source_url text not null,
  source_name text not null,
  image_url text,
  status content_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  published_at timestamptz,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_status_published_idx on public.news (status, published_at desc);
create index news_submitted_by_idx on public.news (submitted_by);

-- ----------------------------------------------------------------------------
-- interview_experiences — submitted, reviewed by admin before publish
-- ----------------------------------------------------------------------------
create table public.interview_experiences (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  company text not null,
  position text not null,
  experience_level experience_level not null,
  rounds text[] not null default '{}',
  interview_questions text[] not null default '{}',
  difficulty interview_difficulty not null,
  process_description text,
  personal_experience text not null,
  status content_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index interview_status_created_idx on public.interview_experiences (status, created_at desc);
create index interview_author_idx on public.interview_experiences (author_id);
create index interview_company_trgm_idx on public.interview_experiences using gin (company gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- bookmarks — polymorphic
-- ----------------------------------------------------------------------------
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('post', 'question', 'discussion', 'news', 'interview_experience')),
  content_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, content_type, content_id)
);

create index bookmarks_user_idx on public.bookmarks (user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- reports — polymorphic content reports + user reports
-- ----------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('post', 'question', 'answer', 'discussion', 'news', 'interview_experience', 'comment', 'user')),
  content_id uuid not null,
  reason report_reason not null,
  description text,
  status report_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index reports_status_idx on public.reports (status, created_at desc);
create index reports_content_idx on public.reports (content_type, content_id);

-- ----------------------------------------------------------------------------
-- reputation_events — audit trail feeding profiles.reputation
-- ----------------------------------------------------------------------------
create table public.reputation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  points integer not null,
  content_type text,
  content_id uuid,
  created_at timestamptz not null default now()
);

create index reputation_events_user_idx on public.reputation_events (user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- badges & user_badges
-- ----------------------------------------------------------------------------
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon text not null,
  created_at timestamptz not null default now()
);

create table public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ----------------------------------------------------------------------------
-- user_interests — selected during onboarding, used to shape Following Feed
-- ----------------------------------------------------------------------------
create table public.user_interests (
  user_id uuid not null references public.profiles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tag_id)
);

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  content_type text,
  content_id uuid,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_unread_idx on public.notifications (user_id, is_read, created_at desc);

-- ============================================================================
-- Functions & triggers
-- ============================================================================

-- updated_at maintenance --------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.posts for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.discussions for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.questions for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.answers for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.comments for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.news for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.interview_experiences for each row execute function public.set_updated_at();

-- auto-create profile on signup -------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '[^a-zA-Z0-9_]', '', 'g'));
  if base_username is null or length(base_username) < 3 then
    base_username := 'user' || substr(new.id::text, 1, 8);
  end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', base_username),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- is_admin / is_moderator helpers (security definer avoids RLS recursion) -
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

create or replace function public.is_moderator_or_admin(uid uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role in ('admin', 'moderator')
  );
$$;

-- counters: posts likes/comments -------------------------------------------
create or replace function public.handle_vote_change()
returns trigger
language plpgsql
as $$
declare
  target_id uuid := coalesce(new.content_id, old.content_id);
  target_type text := coalesce(new.content_type, old.content_type);
  delta_up int := 0;
  delta_down int := 0;
begin
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

  if target_type = 'post' then
    update public.posts set likes_count = greatest(0, likes_count + delta_up) where id = target_id;
  elsif target_type = 'question' then
    update public.questions set upvotes_count = greatest(0, upvotes_count + delta_up), downvotes_count = greatest(0, downvotes_count + delta_down) where id = target_id;
  elsif target_type = 'answer' then
    update public.answers set upvotes_count = greatest(0, upvotes_count + delta_up), downvotes_count = greatest(0, downvotes_count + delta_down) where id = target_id;
  elsif target_type = 'discussion' then
    update public.discussions set upvotes_count = greatest(0, upvotes_count + delta_up), downvotes_count = greatest(0, downvotes_count + delta_down) where id = target_id;
  end if;

  return null;
end;
$$;

create trigger on_vote_change
  after insert or update or delete on public.votes
  for each row execute function public.handle_vote_change();

-- counters: comments ---------------------------------------------------------
create or replace function public.handle_comment_change()
returns trigger
language plpgsql
as $$
declare
  target_id uuid := coalesce(new.content_id, old.content_id);
  target_type text := coalesce(new.content_type, old.content_type);
  delta int := case when tg_op = 'INSERT' then 1 else -1 end;
begin
  if target_type = 'post' then
    update public.posts set comments_count = greatest(0, comments_count + delta) where id = target_id;
  elsif target_type = 'discussion' then
    update public.discussions set comments_count = greatest(0, comments_count + delta) where id = target_id;
  elsif target_type = 'news' then
    update public.news set comments_count = greatest(0, comments_count + delta) where id = target_id;
  elsif target_type = 'interview_experience' then
    update public.interview_experiences set comments_count = greatest(0, comments_count + delta) where id = target_id;
  end if;
  return null;
end;
$$;

create trigger on_comment_insert after insert on public.comments for each row execute function public.handle_comment_change();
create trigger on_comment_delete after delete on public.comments for each row execute function public.handle_comment_change();

-- counters: answers on questions ---------------------------------------------
create or replace function public.handle_answer_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.questions set answers_count = answers_count + 1 where id = new.question_id;
  elsif tg_op = 'DELETE' then
    update public.questions set answers_count = greatest(0, answers_count - 1) where id = old.question_id;
  end if;
  return null;
end;
$$;

create trigger on_answer_insert after insert on public.answers for each row execute function public.handle_answer_change();
create trigger on_answer_delete after delete on public.answers for each row execute function public.handle_answer_change();

-- accepted answer: keep answers.is_accepted in sync with questions.accepted_answer_id
create or replace function public.handle_accepted_answer_change()
returns trigger
language plpgsql
as $$
begin
  if new.accepted_answer_id is distinct from old.accepted_answer_id then
    if old.accepted_answer_id is not null then
      update public.answers set is_accepted = false where id = old.accepted_answer_id;
    end if;
    if new.accepted_answer_id is not null then
      update public.answers set is_accepted = true where id = new.accepted_answer_id;
      insert into public.reputation_events (user_id, event_type, points, content_type, content_id)
      select author_id, 'accepted_answer', 15, 'answer', new.accepted_answer_id
      from public.answers where id = new.accepted_answer_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger on_accepted_answer_change
  after update of accepted_answer_id on public.questions
  for each row execute function public.handle_accepted_answer_change();

-- reputation total: keep profiles.reputation in sync with reputation_events
create or replace function public.handle_reputation_event()
returns trigger
language plpgsql
as $$
begin
  update public.profiles set reputation = reputation + new.points where id = new.user_id;
  return new;
end;
$$;

create trigger on_reputation_event
  after insert on public.reputation_events
  for each row execute function public.handle_reputation_event();

-- tag usage_count -------------------------------------------------------------
create or replace function public.handle_content_tag_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.tags set usage_count = usage_count + 1 where id = new.tag_id;
  elsif tg_op = 'DELETE' then
    update public.tags set usage_count = greatest(0, usage_count - 1) where id = old.tag_id;
  end if;
  return null;
end;
$$;

create trigger on_content_tag_insert after insert on public.content_tags for each row execute function public.handle_content_tag_change();
create trigger on_content_tag_delete after delete on public.content_tags for each row execute function public.handle_content_tag_change();

-- notify on follow -------------------------------------------------------------
create or replace function public.handle_new_follow()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, actor_id, message)
  values (new.following_id, 'new_follower', new.follower_id, 'started following you');
  return new;
end;
$$;

create trigger on_new_follow
  after insert on public.follows
  for each row execute function public.handle_new_follow();

-- notify on new answer -----------------------------------------------------
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
    values (q_author, 'question_answered', new.author_id, 'question', new.question_id, 'answered your question');
  end if;
  return new;
end;
$$;

create trigger on_new_answer_notify
  after insert on public.answers
  for each row execute function public.handle_new_answer();

-- notify + reputation on accepted answer -----------------------------------
create or replace function public.handle_answer_accepted_notify()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_accepted = true and old.is_accepted = false then
    insert into public.notifications (user_id, type, actor_id, content_type, content_id, message)
    values (new.author_id, 'answer_accepted', null, 'answer', new.id, 'your answer was accepted');
  end if;
  return new;
end;
$$;

create trigger on_answer_accepted_notify
  after update of is_accepted on public.answers
  for each row execute function public.handle_answer_accepted_notify();

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.tags enable row level security;
alter table public.content_tags enable row level security;
alter table public.follows enable row level security;
alter table public.posts enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_follows enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;
alter table public.news enable row level security;
alter table public.interview_experiences enable row level security;
alter table public.bookmarks enable row level security;
alter table public.reports enable row level security;
alter table public.reputation_events enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.user_interests enable row level security;
alter table public.notifications enable row level security;

-- profiles ---------------------------------------------------------------
create policy "profiles are publicly readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "admins update any profile" on public.profiles for update using (public.is_admin(auth.uid()));

-- tags ---------------------------------------------------------------------
create policy "tags are publicly readable" on public.tags for select using (true);
create policy "authenticated users create tags" on public.tags for insert to authenticated with check (true);
create policy "admins manage tags" on public.tags for update using (public.is_admin(auth.uid()));
create policy "admins delete tags" on public.tags for delete using (public.is_admin(auth.uid()));

-- content_tags ---------------------------------------------------------------
create policy "content_tags are publicly readable" on public.content_tags for select using (true);
create policy "authenticated users tag their own content" on public.content_tags for insert to authenticated with check (true);
create policy "authenticated users remove tags from own content" on public.content_tags for delete to authenticated using (true);

-- follows ---------------------------------------------------------------
create policy "follows are publicly readable" on public.follows for select using (true);
create policy "users follow as themselves" on public.follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "users unfollow as themselves" on public.follows for delete to authenticated using (auth.uid() = follower_id);

-- posts ---------------------------------------------------------------------
create policy "approved posts are publicly readable" on public.posts for select using (
  status = 'approved' or author_id = auth.uid() or public.is_moderator_or_admin(auth.uid())
);
create policy "users create own posts" on public.posts for insert to authenticated with check (auth.uid() = author_id);
create policy "users update own posts" on public.posts for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "moderators update posts" on public.posts for update using (public.is_moderator_or_admin(auth.uid()));
create policy "users delete own posts" on public.posts for delete using (auth.uid() = author_id or public.is_moderator_or_admin(auth.uid()));

-- discussions -----------------------------------------------------------
create policy "approved discussions are publicly readable" on public.discussions for select using (
  status = 'approved' or author_id = auth.uid() or public.is_moderator_or_admin(auth.uid())
);
create policy "users create own discussions" on public.discussions for insert to authenticated with check (auth.uid() = author_id);
create policy "users update own discussions" on public.discussions for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "moderators update discussions" on public.discussions for update using (public.is_moderator_or_admin(auth.uid()));
create policy "users delete own discussions" on public.discussions for delete using (auth.uid() = author_id or public.is_moderator_or_admin(auth.uid()));

create policy "discussion follows are publicly readable" on public.discussion_follows for select using (true);
create policy "users follow discussions as themselves" on public.discussion_follows for insert to authenticated with check (auth.uid() = user_id);
create policy "users unfollow discussions as themselves" on public.discussion_follows for delete to authenticated using (auth.uid() = user_id);

-- questions & answers -----------------------------------------------------
create policy "approved questions are publicly readable" on public.questions for select using (
  status = 'approved' or author_id = auth.uid() or public.is_moderator_or_admin(auth.uid())
);
create policy "users create own questions" on public.questions for insert to authenticated with check (auth.uid() = author_id);
create policy "users update own questions" on public.questions for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "moderators update questions" on public.questions for update using (public.is_moderator_or_admin(auth.uid()));
create policy "users delete own questions" on public.questions for delete using (auth.uid() = author_id or public.is_moderator_or_admin(auth.uid()));

create policy "answers on visible questions are readable" on public.answers for select using (
  exists (
    select 1 from public.questions q
    where q.id = question_id and (q.status = 'approved' or q.author_id = auth.uid())
  ) or author_id = auth.uid() or public.is_moderator_or_admin(auth.uid())
);
create policy "users create own answers" on public.answers for insert to authenticated with check (auth.uid() = author_id);
create policy "users update own answers" on public.answers for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "question authors mark accepted answer" on public.answers for update using (
  exists (select 1 from public.questions q where q.id = question_id and q.author_id = auth.uid())
);
create policy "users delete own answers" on public.answers for delete using (auth.uid() = author_id or public.is_moderator_or_admin(auth.uid()));

-- comments ---------------------------------------------------------------
create policy "comments are publicly readable" on public.comments for select using (true);
create policy "users create own comments" on public.comments for insert to authenticated with check (auth.uid() = author_id);
create policy "users update own comments" on public.comments for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "users delete own comments" on public.comments for delete using (auth.uid() = author_id or public.is_moderator_or_admin(auth.uid()));

-- votes ---------------------------------------------------------------------
create policy "votes are publicly readable" on public.votes for select using (true);
create policy "users vote as themselves" on public.votes for insert to authenticated with check (auth.uid() = user_id);
create policy "users change own vote" on public.votes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users remove own vote" on public.votes for delete using (auth.uid() = user_id);

-- news ---------------------------------------------------------------------
create policy "approved news are publicly readable" on public.news for select using (
  status = 'approved' or submitted_by = auth.uid() or public.is_moderator_or_admin(auth.uid())
);
create policy "users submit news" on public.news for insert to authenticated with check (auth.uid() = submitted_by);
create policy "users edit own pending news" on public.news for update using (auth.uid() = submitted_by and status = 'pending') with check (auth.uid() = submitted_by);
create policy "moderators review news" on public.news for update using (public.is_moderator_or_admin(auth.uid()));
create policy "moderators delete news" on public.news for delete using (public.is_moderator_or_admin(auth.uid()));

-- interview_experiences -------------------------------------------------
create policy "approved interviews are publicly readable" on public.interview_experiences for select using (
  status = 'approved' or author_id = auth.uid() or public.is_moderator_or_admin(auth.uid())
);
create policy "users submit interview experiences" on public.interview_experiences for insert to authenticated with check (auth.uid() = author_id);
create policy "users edit own pending interviews" on public.interview_experiences for update using (auth.uid() = author_id and status = 'pending') with check (auth.uid() = author_id);
create policy "moderators review interviews" on public.interview_experiences for update using (public.is_moderator_or_admin(auth.uid()));
create policy "moderators delete interviews" on public.interview_experiences for delete using (public.is_moderator_or_admin(auth.uid()));

-- bookmarks ---------------------------------------------------------------
create policy "users read own bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
create policy "users create own bookmarks" on public.bookmarks for insert to authenticated with check (auth.uid() = user_id);
create policy "users delete own bookmarks" on public.bookmarks for delete using (auth.uid() = user_id);

-- reports ---------------------------------------------------------------
create policy "users read own reports" on public.reports for select using (auth.uid() = reporter_id or public.is_moderator_or_admin(auth.uid()));
create policy "users create reports" on public.reports for insert to authenticated with check (auth.uid() = reporter_id);
create policy "moderators update reports" on public.reports for update using (public.is_moderator_or_admin(auth.uid()));

-- reputation_events ---------------------------------------------------------
create policy "users read own reputation events" on public.reputation_events for select using (auth.uid() = user_id or public.is_moderator_or_admin(auth.uid()));

-- badges / user_badges --------------------------------------------------
create policy "badges are publicly readable" on public.badges for select using (true);
create policy "admins manage badges" on public.badges for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "admins update badges" on public.badges for update using (public.is_admin(auth.uid()));
create policy "user_badges are publicly readable" on public.user_badges for select using (true);

-- user_interests ---------------------------------------------------------
create policy "users read own interests" on public.user_interests for select using (auth.uid() = user_id);
create policy "users set own interests" on public.user_interests for insert to authenticated with check (auth.uid() = user_id);
create policy "users remove own interests" on public.user_interests for delete using (auth.uid() = user_id);

-- notifications ---------------------------------------------------------
create policy "users read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "users mark own notifications read" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
