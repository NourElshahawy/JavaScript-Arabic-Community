export async function getDiscussions(supabase, { limit = 20, offset = 0 } = {}) {
  const { data: discussions, error } = await supabase
    .from("discussions")
    .select(
      `id, title, body, upvotes_count, downvotes_count, comments_count, views_count, created_at,
       author:profiles!discussions_author_id_fkey(id, username, full_name, avatar_url, reputation)`
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !discussions?.length) return { discussions: [], error };

  const ids = discussions.map((d) => d.id);
  const { data: tagRows } = await supabase
    .from("content_tags")
    .select("content_id, tag:tags(id, name, slug)")
    .eq("content_type", "discussion")
    .in("content_id", ids);

  const tagsById = new Map();
  for (const row of tagRows ?? []) {
    if (!tagsById.has(row.content_id)) tagsById.set(row.content_id, []);
    tagsById.get(row.content_id).push(row.tag);
  }

  return { discussions: discussions.map((d) => ({ ...d, tags: tagsById.get(d.id) ?? [] })), error: null };
}

export async function getDiscussionById(supabase, id, { userId } = {}) {
  const { data: discussion, error } = await supabase
    .from("discussions")
    .select(
      `id, title, body, author_id, upvotes_count, downvotes_count, comments_count, views_count, created_at,
       author:profiles!discussions_author_id_fkey(id, username, full_name, avatar_url, reputation)`
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !discussion) return { discussion: null, error };

  const [{ data: tagRows }, { data: userVote }, { data: following }, { data: bookmark }] = await Promise.all([
    supabase.from("content_tags").select("tag:tags(id, name, slug)").eq("content_type", "discussion").eq("content_id", id),
    userId
      ? supabase.from("votes").select("value").eq("content_type", "discussion").eq("content_id", id).eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
    userId
      ? supabase.from("discussion_follows").select("user_id").eq("discussion_id", id).eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
    userId
      ? supabase.from("bookmarks").select("id").eq("user_id", userId).eq("content_type", "discussion").eq("content_id", id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    discussion: {
      ...discussion,
      tags: (tagRows ?? []).map((r) => r.tag),
      userVote: userVote?.value ?? null,
      isFollowing: !!following,
      bookmarked: !!bookmark,
    },
    error: null,
  };
}
