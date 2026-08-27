-- Stream new posts to the home feed in real time (used to show a
-- "new posts" banner instead of the feed only ever updating on refresh).
alter publication supabase_realtime add table public.posts;
