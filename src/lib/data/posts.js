// Server-side data access for the home feed and post detail pages.
// Each function takes an already-created Supabase server client so callers
// control auth context (RLS applies per-request based on the session).

import { contentIdsForTag } from "@/lib/data/tag-filter";

// `feed`:
//   "latest"    — every approved post, newest first (default, and the only
//                 option for signed-out visitors)
//   "following" — posts authored by people the viewer follows
//   "foryou"    — union of "following" and posts tagged with one of the
//                 viewer's onboarding interests; falls back to "latest"
//                 when the viewer has neither follows nor interests
export async function getFeedPosts(supabase, { userId, feed = "latest", limit = 20, offset = 0, tagSlug } = {}) {
  let effectiveFeed = userId ? feed : "latest";
  let followingIds = [];
  let interestPostIds = [];

  const tagIds = await contentIdsForTag(supabase, "post", tagSlug);
  if (tagIds && tagIds.length === 0) return { posts: [], error: null };

  if (effectiveFeed === "following" || effectiveFeed === "foryou") {
    const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
    followingIds = (follows ?? []).map((f) => f.following_id);
  }

  if (effectiveFeed === "foryou") {
    const { data: interests } = await supabase.from("user_interests").select("tag_id").eq("user_id", userId);
    const tagIds = (interests ?? []).map((r) => r.tag_id);
    if (tagIds.length) {
      const { data: tagged } = await supabase
        .from("content_tags")
        .select("content_id")
        .eq("content_type", "post")
        .in("tag_id", tagIds)
        .limit(500);
      interestPostIds = [...new Set((tagged ?? []).map((r) => r.content_id))];
    }
    if (followingIds.length === 0 && interestPostIds.length === 0) effectiveFeed = "latest";
  }

  if (effectiveFeed === "following" && followingIds.length === 0) {
    return { posts: [], error: null, empty: "following" };
  }

  let query = supabase
    .from("posts")
    .select(
      `id, body, images, likes_count, comments_count, views_count, created_at,
       author:profiles!posts_author_id_fkey(id, username, full_name, avatar_url, reputation)`
    )
    .eq("status", "approved");

  if (effectiveFeed === "following") {
    query = query.in("author_id", followingIds);
  } else if (effectiveFeed === "foryou") {
    const clauses = [];
    if (followingIds.length) clauses.push(`author_id.in.(${followingIds.join(",")})`);
    if (interestPostIds.length) clauses.push(`id.in.(${interestPostIds.join(",")})`);
    query = query.or(clauses.join(","));
  }

  if (tagIds) query = query.in("id", tagIds);

  const { data: posts, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !posts?.length) return { posts: [], error, empty: effectiveFeed === "following" ? "following" : undefined };

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
