export async function getPublishedInterviews(supabase, { limit = 30 } = {}) {
  const { data, error } = await supabase
    .from("interview_experiences")
    .select(
      `id, company, position, experience_level, difficulty, rounds, personal_experience, likes_count, comments_count, created_at,
       author:profiles!interview_experiences_author_id_fkey(id, username, full_name, avatar_url)`
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  return { interviews: data ?? [], error };
}

export async function getInterviewById(supabase, id, { userId } = {}) {
  const { data: interview, error } = await supabase
    .from("interview_experiences")
    .select(
      `id, company, position, experience_level, difficulty, rounds, interview_questions, process_description,
       personal_experience, status, author_id, likes_count, comments_count, created_at,
       author:profiles!interview_experiences_author_id_fkey(id, username, full_name, avatar_url)`
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !interview) return { interview: null, error };

  const { data: bookmark } = userId
    ? await supabase.from("bookmarks").select("id").eq("user_id", userId).eq("content_type", "interview_experience").eq("content_id", id).maybeSingle()
    : { data: null };

  return { interview: { ...interview, bookmarked: !!bookmark }, error: null };
}
