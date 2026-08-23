// Server-side data access for the home feed and post detail pages.
// Each function takes an already-created Supabase server client so callers
// control auth context (RLS applies per-request based on the session).

export async function getFeedPosts(supabase, { userId, limit = 20, offset = 0 } = {}) {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `id, body, images, likes_count, comments_count, views_count, created_at,
       author:profiles!posts_author_id_fkey(id, username, full_name, avatar_url, reputation)`
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !posts?.length) return { posts: [], error };

  const postIds = posts.map((p) => p.id);

  const [{ data: tagRows }, { data: userVotes }, { data: userBookmarks }] = await Promise.all([
    supabase.from("content_tags").select("content_id, tag:tags(id, name, slug)").eq("content_type", "post").in("content_id", postIds),
    userId
      ? supabase.from("votes").select("content_id").eq("content_type", "post").eq("user_id", userId).in("content_id", postIds)
      : Promise.resolve({ data: [] }),
    userId
      ? supabase.from("bookmarks").select("content_id").eq("content_type", "post").eq("user_id", userId).in("content_id", postIds)
      : Promise.resolve({ data: [] }),
  ]);

  const tagsByPost = new Map();
  for (const row of tagRows ?? []) {
    if (!tagsByPost.has(row.content_id)) tagsByPost.set(row.content_id, []);
    tagsByPost.get(row.content_id).push(row.tag);
  }
  const likedSet = new Set((userVotes ?? []).map((v) => v.content_id));
  const bookmarkedSet = new Set((userBookmarks ?? []).map((b) => b.content_id));

  return {
    posts: posts.map((post) => ({
      ...post,
      tags: tagsByPost.get(post.id) ?? [],
      liked: likedSet.has(post.id),
      bookmarked: bookmarkedSet.has(post.id),
    })),
    error: null,
  };
}

export async function getPostById(supabase, postId, { userId } = {}) {
  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `id, body, images, likes_count, comments_count, views_count, created_at, author_id,
       author:profiles!posts_author_id_fkey(id, username, full_name, avatar_url, reputation)`
    )
    .eq("id", postId)
    .maybeSingle();

  if (error || !post) return { post: null, error };

  const [{ data: tagRows }, { data: userVote }, { data: userBookmark }] = await Promise.all([
    supabase.from("content_tags").select("tag:tags(id, name, slug)").eq("content_type", "post").eq("content_id", postId),
    userId
      ? supabase.from("votes").select("id").eq("content_type", "post").eq("content_id", postId).eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
    userId
      ? supabase.from("bookmarks").select("id").eq("content_type", "post").eq("content_id", postId).eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    post: {
      ...post,
      tags: (tagRows ?? []).map((r) => r.tag),
      liked: !!userVote,
      bookmarked: !!userBookmark,
    },
    error: null,
  };
}
