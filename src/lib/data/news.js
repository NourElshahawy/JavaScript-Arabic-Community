import { contentIdsForTag } from "@/lib/data/tag-filter";

export async function getPublishedNews(supabase, { limit = 20, offset = 0, tagSlug } = {}) {
  const tagIds = await contentIdsForTag(supabase, "news", tagSlug);
  if (tagIds && tagIds.length === 0) return { news: [], error: null };

  let query = supabase
    .from("news")
    .select(
      `id, title, summary, source_url, source_name, image_url, likes_count, comments_count, views_count, published_at,
       submitter:profiles!news_submitted_by_fkey(id, username, full_name, avatar_url)`
    )
    .eq("status", "approved");

  if (tagIds) query = query.in("id", tagIds);

  const { data, error } = await query.order("published_at", { ascending: false }).range(offset, offset + limit - 1);

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
