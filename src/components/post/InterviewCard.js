import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { timeAgo, formatCount } from "@/lib/format";

const LEVEL_LABEL = { intern: "متدرب", junior: "Junior", mid: "Mid", senior: "Senior", lead: "Lead" };
const DIFFICULTY_VARIANT = { easy: "success", medium: "warning", hard: "danger" };
const DIFFICULTY_LABEL = { easy: "سهل", medium: "متوسط", hard: "صعب" };

export function InterviewCard({ interview }) {
  return (
    <article className="post">
      <span className="content-type-label content-type-label--interview">تجربة انترفيو</span>
      <Link href={`/interviews/${interview.id}`}>
        <h3 className="post__title" style={{ marginTop: 4 }}>
          {interview.position} · {interview.company}
        </h3>
      </Link>

      <div className="tag-list" style={{ margin: "var(--space-2) 0" }}>
        <Badge variant="neutral">{LEVEL_LABEL[interview.experience_level]}</Badge>
        <Badge variant={DIFFICULTY_VARIANT[interview.difficulty]}>{DIFFICULTY_LABEL[interview.difficulty]}</Badge>
        {(interview.rounds ?? []).map((round) => (
          <Badge key={round} variant="neutral">
            {round}
          </Badge>
        ))}
      </div>

      <p className="post__body" style={{ WebkitLineClamp: 3, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {interview.personal_experience}
      </p>

      <div className="post__footer">
        <Link href={`/interviews/${interview.id}#comments`} className="action-btn">
          <MessageCircle size={14} />
          {interview.comments_count > 0 ? formatCount(interview.comments_count) : "تعليق"}
        </Link>
        <span className="post__footer-spacer" />
        <span className="post__meta">{timeAgo(interview.created_at)}</span>
      </div>
    </article>
  );
}
