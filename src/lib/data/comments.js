export async function getComments(supabase, contentType, contentId) {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `id, body, created_at, parent_comment_id, author_id,
       author:profiles!comments_author_id_fkey(id, username, full_name, avatar_url)`
    )
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .order("created_at", { ascending: true });

  return { comments: data ?? [], error };
}
