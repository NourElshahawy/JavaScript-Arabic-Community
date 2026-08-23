import Link from "next/link";
import { CheckCircle2, MessageCircle, Eye } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { TagList } from "@/components/ui/Tag";
import { timeAgo, formatCount } from "@/lib/format";

export function QuestionCard({ question }) {
  const score = question.upvotes_count - question.downvotes_count;

  return (
    <article className="post">
      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 48, color: "var(--color-text-muted)" }}>
          <span style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-md)", color: "var(--color-text)" }}>{score}</span>
          <span style={{ fontSize: "var(--text-xs)" }}>صوت</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="content-type-label content-type-label--question">سؤال</span>
          <Link href={`/questions/${question.id}`}>
            <h3 className="post__title" style={{ marginTop: 4 }}>
              {question.title}
              {question.accepted_answer_id ? (
                <CheckCircle2 size={16} style={{ color: "var(--color-accept)", marginInlineStart: 6, verticalAlign: "middle" }} />
              ) : null}
            </h3>
          </Link>
          <p className="post__body" style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {question.body}
          </p>

          <TagList tags={question.tags} />

          <div className="post__header" style={{ marginTop: "var(--space-2)", marginBottom: 0 }}>
            <Link href={`/u/${question.author.username}`} className="post__author">
              <Avatar src={question.author.avatar_url} name={question.author.full_name} size="xs" />
              <span className="post__author-username ltr">@{question.author.username}</span>
            </Link>
            <span className="post__meta">· {timeAgo(question.created_at)}</span>
            <span className="post__footer-spacer" />
            <span className="action-btn" style={{ cursor: "default" }}>
              <MessageCircle size={14} /> {formatCount(question.answers_count)}
            </span>
            <span className="action-btn" style={{ cursor: "default" }}>
              <Eye size={14} /> {formatCount(question.views_count)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
