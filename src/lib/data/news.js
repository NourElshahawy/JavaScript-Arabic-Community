export async function getPublishedNews(supabase, { limit = 30 } = {}) {
  const { data, error } = await supabase
    .from("news")
    .select(
      `id, title, summary, source_url, source_name, image_url, likes_count, comments_count, views_count, published_at,
       submitter:profiles!news_submitted_by_fkey(id, username, full_name, avatar_url)`
    )
    .eq("status", "approved")
    .order("published_at", { ascending: false })
    .limit(limit);

  return { news: data ?? [], error };
}

export async function getNewsById(supabase, newsId, { userId } = {}) {
  const { data: news, error } = await supabase
    .from("news")
    .select(
      `id, title, summary, source_url, source_name, image_url, status, submitted_by, likes_count, comments_count, views_count, published_at, created_at,
       submitter:profiles!news_submitted_by_fkey(id, username, full_name, avatar_url)`
    )
    .eq("id", newsId)
    .maybeSingle();

  if (error || !news) return { news: null, error };

  const { data: bookmark } = userId
    ? await supabase.from("bookmarks").select("id").eq("user_id", userId).eq("content_type", "news").eq("content_id", newsId).maybeSingle()
    : { data: null };

  return { news: { ...news, bookmarked: !!bookmark }, error: null };
}
