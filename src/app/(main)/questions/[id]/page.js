import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getQuestionById, getAnswers } from "@/lib/data/questions";
import { Avatar } from "@/components/ui/Avatar";
import { TagList } from "@/components/ui/Tag";
import { VoteButton } from "@/components/post/VoteButton";
import { BookmarkButton } from "@/components/post/BookmarkButton";
import { ShareButton } from "@/components/post/ShareButton";
import { ReportDialog } from "@/components/post/ReportDialog";
import { AnswersSection } from "@/components/post/AnswersSection";
import { timeAgo, formatCount } from "@/lib/format";

export async function generateMetadata({ params }) {
  const supabase = await createClient();
  const { question } = await getQuestionById(supabase, params.id);
  if (!question) return {};
  return { title: question.title, description: question.body.slice(0, 160) };
}

export default async function QuestionDetailPage({ params }) {
  const supabase = await createClient();
  const { user, profile } = await getCurrentUser();
  const { question } = await getQuestionById(supabase, params.id, { userId: user?.id });

  if (!question) notFound();

  await supabase.rpc("increment_view_count", { p_content_type: "question", p_content_id: params.id });

  const { answers } = await getAnswers(supabase, params.id, { userId: user?.id });

  const { data: bookmark } = user
    ? await supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("content_type", "question").eq("content_id", params.id).maybeSingle()
    : { data: null };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div className="card" style={{ display: "flex", gap: "var(--space-4)" }}>
        <VoteButton
          contentType="question"
          contentId={question.id}
          initialVote={question.userVote}
          initialScore={question.upvotes_count - question.downvotes_count}
          isAuthenticated={!!user}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="content-type-label content-type-label--question">سؤال</span>
          <h1 style={{ marginTop: 4 }}>{question.title}</h1>

          <div className="post__header" style={{ marginTop: "var(--space-2)" }}>
            <Link href={`/u/${question.author.username}`} className="post__author">
              <Avatar src={question.author.avatar_url} name={question.author.full_name} size="sm" />
              <span className="post__author-name">{question.author.full_name}</span>
              <span className="post__author-username ltr">@{question.author.username}</span>
            </Link>
            <span className="post__meta">· {timeAgo(question.created_at)}</span>
          </div>

          <p className="post__body">{question.body}</p>

          <TagList tags={question.tags} />

          <div className="post__footer">
            <span className="action-btn" style={{ cursor: "default" }}>
              <Eye size={16} /> {formatCount(question.views_count)}
            </span>
            <ShareButton path={`/questions/${question.id}`} />
            <span className="post__footer-spacer" />
            <BookmarkButton contentType="question" contentId={question.id} initialBookmarked={!!bookmark} isAuthenticated={!!user} />
            <ReportDialog contentType="question" contentId={question.id} isAuthenticated={!!user} />
          </div>
        </div>
      </div>

      <AnswersSection question={question} answers={answers} currentUser={profile} />
    </div>
  );
}
