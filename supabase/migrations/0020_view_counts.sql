-- ============================================================================
-- View counting. `views_count` columns existed since 0001 and are shown all
-- over the UI, but nothing ever incremented them. This adds a single
-- SECURITY DEFINER function that bumps the counter for one row of one
-- content type, callable by anon and authenticated alike (reading a page
-- shouldn't require a login). It can only ever do `views_count = views_count
-- + 1` on a row the caller names, so exposing it broadly is safe.
-- ============================================================================

create or replace function public.increment_view_count(p_content_type text, p_content_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  case p_content_type
    when 'post' then
      update public.posts set views_count = views_count + 1 where id = p_content_id;
    when 'question' then
      update public.questions set views_count = views_count + 1 where id = p_content_id;
    when 'discussion' then
      update public.discussions set views_count = views_count + 1 where id = p_content_id;
    when 'news' then
      update public.news set views_count = views_count + 1 where id = p_content_id;
    else
      -- Unknown type: no-op rather than error, so a bad caller can't 500 a page.
      null;
  end case;
end;
$$;

grant execute on function public.increment_view_count(text, uuid) to anon, authenticated;
