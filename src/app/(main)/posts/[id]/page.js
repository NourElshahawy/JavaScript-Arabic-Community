import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getPostById } from "@/lib/data/posts";
import { getComments } from "@/lib/data/comments";
import { Avatar } from "@/components/ui/Avatar";
import { TagList } from "@/components/ui/Tag";
import { LikeButton } from "@/components/post/LikeButton";
import { BookmarkButton } from "@/components/post/BookmarkButton";
import { ShareButton } from "@/components/post/ShareButton";
import { ReportDialog } from "@/components/post/ReportDialog";
import { CommentSection } from "@/components/post/CommentSection";
import { timeAgo, formatCount } from "@/lib/format";

export async function generateMetadata({ params }) {
  const supabase = await createClient();
  const { post } = await getPostById(supabase, params.id);
  if (!post) return {};
  return {
    title: post.body.slice(0, 70),
    description: post.body.slice(0, 160),
  };
}

export default async function PostDetailPage({ params }) {
  const supabase = await createClient();
  const { user, profile } = await getCurrentUser();
  const { post } = await getPostById(supabase, params.id, { userId: user?.id });

  if (!post) notFound();

  const { comments } = await getComments(supabase, "post", params.id);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div className="post__header">
        <Link href={`/u/${post.author.username}`} className="post__author">
          <Avatar src={post.author.avatar_url} name={post.author.full_name} size="sm" />
          <span className="post__author-name">{post.author.full_name}</span>
          <span className="post__author-username ltr">@{post.author.username}</span>
        </Link>
        <span className="post__meta">· {timeAgo(post.created_at)}</span>
      </div>

      <p className="post__body">{post.body}</p>

      <TagList tags={post.tags} />

      <div className="post__footer">
        <LikeButton postId={post.id} initialLiked={post.liked} initialCount={post.likes_count} isAuthenticated={!!user} />
        <span className="action-btn" style={{ cursor: "default" }}>
          <Eye size={16} />
          {formatCount(post.views_count)}
        </span>
        <ShareButton path={`/posts/${post.id}`} />
        <span className="post__footer-spacer" />
        <BookmarkButton contentId={post.id} initialBookmarked={post.bookmarked} isAuthenticated={!!user} />
        <ReportDialog contentType="post" contentId={post.id} isAuthenticated={!!user} />
      </div>

      <CommentSection contentType="post" contentId={post.id} comments={comments} currentProfile={profile} />
    </div>
  );
}
