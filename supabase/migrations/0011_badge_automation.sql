-- ============================================================================
-- Automatic badge awarding for the badges seeded in 0002_seed_reference_data.sql.
-- 'top-contributor' and 'javascript-expert' are left out here since the spec
-- treats them as judgment calls, not a countable trigger condition; they're
-- awarded manually by an admin instead (see admin Users panel).
-- ============================================================================

create or replace function public.award_badge(p_user_id uuid, p_slug text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_badges (user_id, badge_id)
  select p_user_id, id from public.badges where slug = p_slug
  on conflict do nothing;
end;
$$;

-- first-question ------------------------------------------------------------
create or replace function public.handle_first_question()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  question_count int;
begin
  select count(*) into question_count from public.questions where author_id = new.author_id;
  if question_count = 1 then
    perform public.award_badge(new.author_id, 'first-question');
  end if;
  return new;
end;
$$;

create trigger on_first_question
  after insert on public.questions
  for each row execute function public.handle_first_question();

-- first-answer ----------------------------------------------------------------
create or replace function public.handle_first_answer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  answer_count int;
begin
  select count(*) into answer_count from public.answers where author_id = new.author_id;
  if answer_count = 1 then
    perform public.award_badge(new.author_id, 'first-answer');
  end if;
  return new;
end;
$$;

create trigger on_first_answer
  after insert on public.answers
  for each row execute function public.handle_first_answer();

-- problem-solver: 5+ accepted answers -----------------------------------------
create or replace function public.handle_problem_solver()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  accepted_count int;
begin
  if new.is_accepted = true and old.is_accepted = false then
    select count(*) into accepted_count from public.answers where author_id = new.author_id and is_accepted = true;
    if accepted_count >= 5 then
      perform public.award_badge(new.author_id, 'problem-solver');
    end if;
  end if;
  return new;
end;
$$;

create trigger on_problem_solver
  after update of is_accepted on public.answers
  for each row execute function public.handle_problem_solver();

-- helpful-developer: 10+ net upvotes received across answers -----------------
-- Computed directly from public.votes (not answers.upvotes_count) since
-- trigger execution order across on_vote_change and this trigger is not
-- guaranteed, so the cached counter column may not be updated yet.
create or replace function public.handle_helpful_developer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  answer_author uuid;
  total_upvotes int;
begin
  if new.content_type = 'answer' and new.value = 'up' then
    select author_id into answer_author from public.answers where id = new.content_id;

    select count(*) into total_upvotes
    from public.votes v
    join public.answers a on a.id = v.content_id
    where v.content_type = 'answer' and v.value = 'up' and a.author_id = answer_author;

    if total_upvotes >= 10 then
      perform public.award_badge(answer_author, 'helpful-developer');
    end if;
  end if;
  return new;
end;
$$;

create trigger on_helpful_developer
  after insert on public.votes
  for each row execute function public.handle_helpful_developer();
