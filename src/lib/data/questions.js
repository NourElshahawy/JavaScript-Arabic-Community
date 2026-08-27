import { contentIdsForTag } from "@/lib/data/tag-filter";

// sort: "newest" (default) | "votes" (highest upvotes) | "unanswered"
export async function getQuestions(supabase, { limit = 20, offset = 0, sort = "newest", tagSlug } = {}) {
  const tagIds = await contentIdsForTag(supabase, "question", tagSlug);
  if (tagIds && tagIds.length === 0) return { questions: [], error: null };

  let query = supabase
    .from("questions")
    .select(
      `id, title, body, accepted_answer_id, upvotes_count, downvotes_count, answers_count, views_count, created_at,
       author:profiles!questions_author_id_fkey(id, username, full_name, avatar_url, reputation)`
    )
    .eq("status", "approved");

  if (tagIds) query = query.in("id", tagIds);
  if (sort === "unanswered") query = query.eq("answers_count", 0);
  if (sort === "votes") query = query.order("upvotes_count", { ascending: false });
  query = query.order("created_at", { ascending: false });

  const { data: questions, error } = await query.range(offset, offset + limit - 1);

  if (error || !questions?.length) return { questions: [], error };

  const questionIds = questions.map((q) => q.id);
  const { data: tagRows } = await supabase
    .from("content_tags")
    .select("content_id, tag:tags(id, name, slug)")
    .eq("content_type", "question")
    .in("content_id", questionIds);

  const tagsByQuestion = new Map();
  for (const row of tagRows ?? []) {
    if (!tagsByQuestion.has(row.content_id)) tagsByQuestion.set(row.content_id, []);
    tagsByQuestion.get(row.content_id).push(row.tag);
  }

  return {
    questions: questions.map((q) => ({ ...q, tags: tagsByQuestion.get(q.id) ?? [] })),
    error: null,
  };
}

export async function getQuestionById(supabase, questionId, { userId } = {}) {
  const { data: question, error } = await supabase
    .from("questions")
    .select(
      `id, title, body, author_id, accepted_answer_id, upvotes_count, downvotes_count, answers_count, views_count, created_at,
       author:profiles!questions_author_id_fkey(id, username, full_name, avatar_url, reputation)`
    )
    .eq("id", questionId)
    .maybeSingle();

  if (error || !question) return { question: null, error };

  const [{ data: tagRows }, { data: userVote }] = await Promise.all([
    supabase.from("content_tags").select("tag:tags(id, name, slug)").eq("content_type", "question").eq("content_id", questionId),
    userId
      ? supabase.from("votes").select("value").eq("content_type", "question").eq("content_id", questionId).eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    question: {
      ...question,
      tags: (tagRows ?? []).map((r) => r.tag),
      userVote: userVote?.value ?? null,
    },
    error: null,
  };
}

export async function getAnswers(supabase, questionId, { userId } = {}) {
  const { data: answers, error } = await supabase
    .from("answers")
    .select(
      `id, body, is_accepted, upvotes_count, downvotes_count, created_at, author_id,
       author:profiles!answers_author_id_fkey(id, username, full_name, avatar_url, reputation)`
    )
    .eq("question_id", questionId)
    .order("is_accepted", { ascending: false })
    .order("upvotes_count", { ascending: false });

  if (error || !answers?.length) return { answers: [], error };

  const answerIds = answers.map((a) => a.id);
  const { data: userVotes } = userId
    ? await supabase.from("votes").select("content_id, value").eq("content_type", "answer").eq("user_id", userId).in("content_id", answerIds)
    : { data: [] };

  const voteByAnswer = new Map((userVotes ?? []).map((v) => [v.content_id, v.value]));

  return {
    answers: answers.map((a) => ({ ...a, userVote: voteByAnswer.get(a.id) ?? null })),
    error: null,
  };
}
