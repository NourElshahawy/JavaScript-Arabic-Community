import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getDiscussionById } from "@/lib/data/discussions";
import { getComments } from "@/lib/data/comments";
import { Avatar } from "@/components/ui/Avatar";
import { TagList } from "@/components/ui/Tag";
import { VoteButton } from "@/components/post/VoteButton";
import { BookmarkButton } from "@/components/post/BookmarkButton";
import { ShareButton } from "@/components/post/ShareButton";
import { ReportDialog } from "@/components/post/ReportDialog";
import { DiscussionFollowButton } from "@/components/post/DiscussionFollowButton";
import { CommentSection } from "@/components/post/CommentSection";
import { timeAgo, formatCount } from "@/lib/format";

export async function generateMetadata({ params }) {
  const supabase = await createClient();
  const { discussion } = await getDiscussionById(supabase, params.id);
  if (!discussion) return {};
  return { title: discussion.title, description: discussion.body.slice(0, 160) };
}

export default async function DiscussionDetailPage({ params }) {
  const supabase = await createClient();
  const { user, profile } = await getCurrentUser();
  const { discussion } = await getDiscussionById(supabase, params.id, { userId: user?.id });

  if (!discussion) notFound();

  const { comments } = await getComments(supabase, "discussion", params.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div className="card" style={{ display: "flex", gap: "var(--space-4)" }}>
        <VoteButton
          contentType="discussion"
          contentId={discussion.id}
          initialVote={discussion.userVote}
          initialScore={discussion.upvotes_count - discussion.downvotes_count}
          isAuthenticated={!!user}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="content-type-label content-type-label--discussion">نقاش</span>
          <h1 style={{ marginTop: 4 }}>{discussion.title}</h1>

          <div className="post__header" style={{ marginTop: "var(--space-2)" }}>
            <Link href={`/u/${discussion.author.username}`} className="post__author">
              <Avatar src={discussion.author.avatar_url} name={discussion.author.full_name} size="sm" />
              <span className="post__author-name">{discussion.author.full_name}</span>
              <span className="post__author-username ltr">@{discussion.author.username}</span>
            </Link>
            <span className="post__meta">· {timeAgo(discussion.created_at)}</span>
          </div>

          <p className="post__body">{discussion.body}</p>

          <TagList tags={discussion.tags} />

          <div className="post__footer">
            <span className="action-btn" style={{ cursor: "default" }}>
              <Eye size={16} /> {formatCount(discussion.views_count)}
            </span>
            <ShareButton path={`/discussions/${discussion.id}`} />
            <DiscussionFollowButton discussionId={discussion.id} initialFollowing={discussion.isFollowing} isAuthenticated={!!user} />
            <span className="post__footer-spacer" />
            <BookmarkButton contentType="discussion" contentId={discussion.id} initialBookmarked={discussion.bookmarked} isAuthenticated={!!user} />
            <ReportDialog contentType="discussion" contentId={discussion.id} isAuthenticated={!!user} />
          </div>
        </div>
      </div>

      <CommentSection contentType="discussion" contentId={discussion.id} comments={comments} currentProfile={profile} />
    </div>
  );
}
