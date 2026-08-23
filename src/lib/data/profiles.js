export async function getProfileByUsername(supabase, username, { viewerId } = {}) {
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();

  if (error || !profile) return { profile: null, error };

  const [{ count: followersCount }, { count: followingCount }, { count: postsCount }, viewerFollow, { data: badges }] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", profile.id).eq("status", "approved"),
    viewerId && viewerId !== profile.id
      ? supabase.from("follows").select("follower_id").eq("follower_id", viewerId).eq("following_id", profile.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("user_badges").select("badge:badges(id, slug, name, description, icon)").eq("user_id", profile.id),
  ]);

  return {
    profile: {
      ...profile,
      followersCount: followersCount ?? 0,
      followingCount: followingCount ?? 0,
      postsCount: postsCount ?? 0,
      isFollowedByViewer: !!viewerFollow.data,
      badges: badges ?? [],
    },
    error: null,
  };
}

export async function getPostsByAuthor(supabase, authorId, { userId } = {}) {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `id, body, images, likes_count, comments_count, views_count, created_at,
       author:profiles!posts_author_id_fkey(id, username, full_name, avatar_url, reputation)`
    )
    .eq("author_id", authorId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !posts?.length) return { posts: [], error };

  const postIds = posts.map((p) => p.id);
  const [{ data: userVotes }, { data: userBookmarks }] = await Promise.all([
    userId
      ? supabase.from("votes").select("content_id").eq("content_type", "post").eq("user_id", userId).in("content_id", postIds)
      : Promise.resolve({ data: [] }),
    userId
      ? supabase.from("bookmarks").select("content_id").eq("content_type", "post").eq("user_id", userId).in("content_id", postIds)
      : Promise.resolve({ data: [] }),
  ]);

  const likedSet = new Set((userVotes ?? []).map((v) => v.content_id));
  const bookmarkedSet = new Set((userBookmarks ?? []).map((b) => b.content_id));

  return {
    posts: posts.map((post) => ({ ...post, tags: [], liked: likedSet.has(post.id), bookmarked: bookmarkedSet.has(post.id) })),
    error: null,
  };
}
