import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getInterviewById } from "@/lib/data/interviews";
import { getComments } from "@/lib/data/comments";
import { Badge } from "@/components/ui/Badge";
import { BookmarkButton } from "@/components/post/BookmarkButton";
import { ShareButton } from "@/components/post/ShareButton";
import { ReportDialog } from "@/components/post/ReportDialog";
import { CommentSection } from "@/components/post/CommentSection";
import { timeAgo } from "@/lib/format";

const LEVEL_LABEL = { intern: "متدرب", junior: "Junior", mid: "Mid", senior: "Senior", lead: "Lead" };
const DIFFICULTY_VARIANT = { easy: "success", medium: "warning", hard: "danger" };
const DIFFICULTY_LABEL = { easy: "سهل", medium: "متوسط", hard: "صعب" };

export async function generateMetadata({ params }) {
  const supabase = await createClient();
  const { interview } = await getInterviewById(supabase, params.id);
  if (!interview) return {};
  return { title: `${interview.position} في ${interview.company}` };
}

export default async function InterviewDetailPage({ params }) {
  const supabase = await createClient();
  const { user, profile } = await getCurrentUser();
  const { interview } = await getInterviewById(supabase, params.id, { userId: user?.id });

  if (!interview || (interview.status !== "approved" && interview.author_id !== user?.id)) notFound();

  const { comments } = await getComments(supabase, "interview_experience", params.id);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <span className="content-type-label content-type-label--interview">تجربة انترفيو</span>
      <h1>
        {interview.position} · {interview.company}
      </h1>

      <div className="tag-list">
        <Badge variant="neutral">{LEVEL_LABEL[interview.experience_level]}</Badge>
        <Badge variant={DIFFICULTY_VARIANT[interview.difficulty]}>{DIFFICULTY_LABEL[interview.difficulty]}</Badge>
      </div>

      {interview.rounds?.length ? (
        <div>
          <h3>مراحل المقابلة</h3>
          <ul style={{ listStyle: "disc", paddingInlineStart: "var(--space-5)", color: "var(--color-text)" }}>
            {interview.rounds.map((round, i) => (
              <li key={i}>{round}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {interview.interview_questions?.length ? (
        <div>
          <h3>أسئلة المقابلة</h3>
          <ul style={{ listStyle: "disc", paddingInlineStart: "var(--space-5)", color: "var(--color-text)" }}>
            {interview.interview_questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {interview.process_description ? (
        <div>
          <h3>وصف العملية</h3>
          <p className="post__body">{interview.process_description}</p>
        </div>
      ) : null}

      <div>
        <h3>التجربة الشخصية</h3>
        <p className="post__body">{interview.personal_experience}</p>
      </div>

      <div className="post__header" style={{ marginBottom: 0 }}>
        <span className="post__author">
          <span className="post__author-name">{interview.author.full_name}</span>
          <span className="post__author-username ltr">@{interview.author.username}</span>
        </span>
        <span className="post__meta">· {timeAgo(interview.created_at)}</span>
      </div>

      <div className="post__footer">
        <ShareButton path={`/interviews/${interview.id}`} />
        <span className="post__footer-spacer" />
        <BookmarkButton contentType="interview_experience" contentId={interview.id} initialBookmarked={interview.bookmarked} isAuthenticated={!!user} />
        <ReportDialog contentType="interview_experience" contentId={interview.id} isAuthenticated={!!user} />
      </div>

      <CommentSection contentType="interview_experience" contentId={interview.id} comments={comments} currentProfile={profile} />
    </div>
  );
}
