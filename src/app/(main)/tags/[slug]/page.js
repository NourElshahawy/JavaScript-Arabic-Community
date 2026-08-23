import { notFound } from "next/navigation";
import { Hash } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { PostCard } from "@/components/post/PostCard";
import { QuestionCard } from "@/components/post/QuestionCard";
import { DiscussionCard } from "@/components/post/DiscussionCard";
import { NewsCard } from "@/components/post/NewsCard";
import { InterviewCard } from "@/components/post/InterviewCard";
import { EmptyState } from "@/components/ui/States";

export async function generateMetadata({ params }) {
  return { title: `وسم: ${params.slug}` };
}

async function taggedIds(supabase, tagId, contentType) {
  const { data } = await supabase.from("content_tags").select("content_id").eq("content_type", contentType).eq("tag_id", tagId);
  return (data ?? []).map((r) => r.content_id);
}

export default async function TagPage({ params }) {
  const supabase = await createClient();
  const { user } = await getCurrentUser();

  const { data: tag } = await supabase.from("tags").select("id, name, slug").eq("slug", params.slug).maybeSingle();
  if (!tag) notFound();

  const [postIds, questionIds, discussionIds, newsIds, interviewIds] = await Promise.all([
    taggedIds(supabase, tag.id, "post"),
    taggedIds(supabase, tag.id, "question"),
    taggedIds(supabase, tag.id, "discussion"),
    taggedIds(supabase, tag.id, "news"),
    taggedIds(supabase, tag.id, "interview_experience"),
  ]);

  const [{ data: posts }, { data: questions }, { data: discussions }, { data: news }, { data: interviews }] = await Promise.all([
    postIds.length
      ? supabase
          .from("posts")
          .select(
            `id, body, images, likes_count, comments_count, views_count, created_at,
             author:profiles!posts_author_id_fkey(id, username, full_name, avatar_url, reputation)`
          )
          .in("id", postIds)
          .eq("status", "approved")
      : Promise.resolve({ data: [] }),
    questionIds.length
      ? supabase
          .from("questions")
          .select(
            `id, title, body, accepted_answer_id, upvotes_count, downvotes_count, answers_count, views_count, created_at,
             author:profiles!questions_author_id_fkey(id, username, full_name, avatar_url, reputation)`
          )
          .in("id", questionIds)
          .eq("status", "approved")
      : Promise.resolve({ data: [] }),
    discussionIds.length
      ? supabase
          .from("discussions")
          .select(
            `id, title, body, upvotes_count, downvotes_count, comments_count, views_count, created_at,
             author:profiles!discussions_author_id_fkey(id, username, full_name, avatar_url, reputation)`
          )
          .in("id", discussionIds)
          .eq("status", "approved")
      : Promise.resolve({ data: [] }),
    newsIds.length
      ? supabase
          .from("news")
          .select(
            `id, title, summary, source_url, source_name, image_url, likes_count, comments_count, views_count, published_at,
             submitter:profiles!news_submitted_by_fkey(id, username, full_name, avatar_url)`
          )
          .in("id", newsIds)
          .eq("status", "approved")
      : Promise.resolve({ data: [] }),
    interviewIds.length
      ? supabase
          .from("interview_experiences")
          .select(
            `id, company, position, experience_level, difficulty, rounds, personal_experience, likes_count, comments_count, created_at,
             author:profiles!interview_experiences_author_id_fkey(id, username, full_name, avatar_url)`
          )
          .in("id", interviewIds)
          .eq("status", "approved")
      : Promise.resolve({ data: [] }),
  ]);

  const postResults = (posts ?? []).map((p) => ({ ...p, tags: [tag], liked: false, bookmarked: false }));
  const questionResults = (questions ?? []).map((q) => ({ ...q, tags: [tag] }));
  const discussionResults = (discussions ?? []).map((d) => ({ ...d, tags: [tag] }));

  const hasResults = postResults.length || questionResults.length || discussionResults.length || news?.length || interviews?.length;

  return (
    <div>
      <h1 style={{ marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: 6 }}>
        <Hash size={22} style={{ color: "var(--color-text-muted)" }} /> {tag.name}
      </h1>

      {!hasResults ? (
        <div className="card">
          <EmptyState icon={Hash} title="لا يوجد محتوى بهذا الوسم بعد" />
        </div>
      ) : (
        <>
          {questionResults.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
          {discussionResults.map((d) => (
            <DiscussionCard key={d.id} discussion={d} />
          ))}
          {(news ?? []).map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
          {(interviews ?? []).map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
          {postResults.map((post) => (
            <PostCard key={post.id} post={post} isAuthenticated={!!user} />
          ))}
        </>
      )}
    </div>
  );
}
