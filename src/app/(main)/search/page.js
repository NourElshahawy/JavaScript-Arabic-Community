import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { Avatar } from "@/components/ui/Avatar";
import { PostCard } from "@/components/post/PostCard";
import { QuestionCard } from "@/components/post/QuestionCard";
import { DiscussionCard } from "@/components/post/DiscussionCard";
import { NewsCard } from "@/components/post/NewsCard";
import { InterviewCard } from "@/components/post/InterviewCard";
import { EmptyState } from "@/components/ui/States";

export const metadata = { title: "البحث" };

const POST_FIELDS = `id, body, images, likes_count, comments_count, views_count, created_at,
  author:profiles!posts_author_id_fkey(id, username, full_name, avatar_url, reputation)`;
const QUESTION_FIELDS = `id, title, body, accepted_answer_id, upvotes_count, downvotes_count, answers_count, views_count, created_at,
  author:profiles!questions_author_id_fkey(id, username, full_name, avatar_url, reputation)`;
const DISCUSSION_FIELDS = `id, title, body, upvotes_count, downvotes_count, comments_count, views_count, created_at,
  author:profiles!discussions_author_id_fkey(id, username, full_name, avatar_url, reputation)`;
const NEWS_FIELDS = `id, title, summary, source_url, source_name, image_url, likes_count, comments_count, views_count, published_at,
  submitter:profiles!news_submitted_by_fkey(id, username, full_name, avatar_url)`;
const INTERVIEW_FIELDS = `id, company, position, experience_level, difficulty, rounds, personal_experience, likes_count, comments_count, created_at,
  author:profiles!interview_experiences_author_id_fkey(id, username, full_name, avatar_url)`;

export default async function SearchPage({ searchParams }) {
  const query = (searchParams?.q || "").trim();
  const { user } = await getCurrentUser();
  const supabase = await createClient();

  if (!query) {
    return (
      <div className="card">
        <EmptyState
          icon={SearchIcon}
          title="ابحث في المجتمع"
          description="اكتب كلمة للبحث عن منشورات، أسئلة، نقاشات، أخبار، تجارب انترفيو، مطورين، أو وسوم."
        />
      </div>
    );
  }

  const like = `%${query}%`;

  const [{ data: posts }, { data: questions }, { data: discussions }, { data: news }, { data: interviews }, { data: profiles }, { data: tags }] =
    await Promise.all([
      supabase.from("posts").select(POST_FIELDS).eq("status", "approved").ilike("body", like).limit(10),
      supabase.from("questions").select(QUESTION_FIELDS).eq("status", "approved").or(`title.ilike.${like},body.ilike.${like}`).limit(10),
      supabase.from("discussions").select(DISCUSSION_FIELDS).eq("status", "approved").or(`title.ilike.${like},body.ilike.${like}`).limit(10),
      supabase.from("news").select(NEWS_FIELDS).eq("status", "approved").or(`title.ilike.${like},summary.ilike.${like}`).limit(10),
      supabase
        .from("interview_experiences")
        .select(INTERVIEW_FIELDS)
        .eq("status", "approved")
        .or(`company.ilike.${like},position.ilike.${like}`)
        .limit(10),
      supabase.from("profiles").select("id, username, full_name, avatar_url").or(`username.ilike.${like},full_name.ilike.${like}`).limit(10),
      supabase.from("tags").select("id, name, slug").ilike("name", like).limit(10),
    ]);

  const postResults = (posts ?? []).map((p) => ({ ...p, tags: [], liked: false, bookmarked: false }));
  const questionResults = (questions ?? []).map((q) => ({ ...q, tags: [] }));
  const discussionResults = (discussions ?? []).map((d) => ({ ...d, tags: [] }));

  const hasResults =
    postResults.length || questionResults.length || discussionResults.length || news?.length || interviews?.length || profiles?.length || tags?.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <h1>
        نتائج البحث عن: <span className="ltr">{query}</span>
      </h1>

      {!hasResults ? (
        <div className="card">
          <EmptyState icon={SearchIcon} title="لا توجد نتائج" description="جرّب كلمات بحث مختلفة." />
        </div>
      ) : (
        <>
          {tags?.length ? (
            <section>
              <h3 style={{ marginBottom: "var(--space-2)" }}>الوسوم</h3>
              <div className="tag-list">
                {tags.map((tag) => (
                  <Link key={tag.id} href={`/tags/${tag.slug}`} className="tag">
                    {tag.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {profiles?.length ? (
            <section>
              <h3 style={{ marginBottom: "var(--space-2)" }}>المطورون</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {profiles.map((p) => (
                  <Link key={p.id} href={`/u/${p.username}`} className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <Avatar src={p.avatar_url} name={p.full_name} size="sm" />
                    <span>{p.full_name}</span>
                    <span className="post__author-username ltr">@{p.username}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {questionResults.length ? (
            <section>
              <h3 style={{ marginBottom: "var(--space-2)" }}>الأسئلة</h3>
              {questionResults.map((q) => (
                <QuestionCard key={q.id} question={q} />
              ))}
            </section>
          ) : null}

          {discussionResults.length ? (
            <section>
              <h3 style={{ marginBottom: "var(--space-2)" }}>النقاشات</h3>
              {discussionResults.map((d) => (
                <DiscussionCard key={d.id} discussion={d} />
              ))}
            </section>
          ) : null}

          {news?.length ? (
            <section>
              <h3 style={{ marginBottom: "var(--space-2)" }}>الأخبار</h3>
              {news.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </section>
          ) : null}

          {interviews?.length ? (
            <section>
              <h3 style={{ marginBottom: "var(--space-2)" }}>تجارب الانترفيو</h3>
              {interviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </section>
          ) : null}

          {postResults.length ? (
            <section>
              <h3 style={{ marginBottom: "var(--space-2)" }}>المنشورات</h3>
              {postResults.map((post) => (
                <PostCard key={post.id} post={post} isAuthenticated={!!user} />
              ))}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
