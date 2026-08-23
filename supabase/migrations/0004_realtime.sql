-- Stream new notifications to clients in real time (used by the
-- notifications bell / list to update without a page refresh).
alter publication supabase_realtime add table public.notifications;
