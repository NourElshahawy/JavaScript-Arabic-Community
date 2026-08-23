import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { TagList } from "@/components/ui/Tag";
import { timeAgo, formatCount } from "@/lib/format";

export function DiscussionCard({ discussion }) {
  const score = discussion.upvotes_count - discussion.downvotes_count;

  return (
    <article className="post">
      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 48, color: "var(--color-text-muted)" }}>
          <span style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-md)", color: "var(--color-text)" }}>{score}</span>
          <span style={{ fontSize: "var(--text-xs)" }}>صوت</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="content-type-label content-type-label--discussion">نقاش</span>
          <Link href={`/discussions/${discussion.id}`}>
            <h3 className="post__title" style={{ marginTop: 4 }}>
              {discussion.title}
            </h3>
          </Link>
          <p className="post__body" style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {discussion.body}
          </p>

          <TagList tags={discussion.tags} />

          <div className="post__header" style={{ marginTop: "var(--space-2)", marginBottom: 0 }}>
            <Link href={`/u/${discussion.author.username}`} className="post__author">
              <Avatar src={discussion.author.avatar_url} name={discussion.author.full_name} size="xs" />
              <span className="post__author-username ltr">@{discussion.author.username}</span>
            </Link>
            <span className="post__meta">· {timeAgo(discussion.created_at)}</span>
            <span className="post__footer-spacer" />
            <span className="action-btn" style={{ cursor: "default" }}>
              <MessageCircle size={14} /> {formatCount(discussion.comments_count)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
