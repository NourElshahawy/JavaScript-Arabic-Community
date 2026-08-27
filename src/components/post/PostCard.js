import Link from "next/link";
import { MessageCircle, Eye, Flag } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { TagList } from "@/components/ui/Tag";
import { LikeButton } from "@/components/post/LikeButton";
import { BookmarkButton } from "@/components/post/BookmarkButton";
import { ShareButton } from "@/components/post/ShareButton";
import { ReportDialog } from "@/components/post/ReportDialog";
import { PostImages } from "@/components/post/PostImages";
import { timeAgo, formatCount } from "@/lib/format";

export function PostCard({ post, isAuthenticated }) {
  const author = post.author;

  return (
    <article className="post">
      <div className="post__header">
        <Link href={`/u/${author.username}`} className="post__author">
          <Avatar src={author.avatar_url} name={author.full_name} size="sm" />
          <span className="post__author-name">{author.full_name}</span>
          <span className="post__author-username ltr">@{author.username}</span>
        </Link>
        <span className="post__meta">· {timeAgo(post.created_at)}</span>
      </div>

      <Link href={`/posts/${post.id}`}>
        <p className="post__body">{post.body}</p>
      </Link>

      <PostImages images={post.images} />

      <TagList tags={post.tags} />

      <div className="post__footer">
        <LikeButton postId={post.id} initialLiked={post.liked} initialCount={post.likes_count} isAuthenticated={isAuthenticated} />
        <Link href={`/posts/${post.id}#comments`} className="action-btn">
          <MessageCircle size={16} />
          {post.comments_count > 0 ? formatCount(post.comments_count) : "تعليق"}
        </Link>
        <ShareButton path={`/posts/${post.id}`} />
        <span className="action-btn" style={{ cursor: "default" }}>
          <Eye size={16} />
          {formatCount(post.views_count)}
        </span>
        <span className="post__footer-spacer" />
        <BookmarkButton contentId={post.id} initialBookmarked={post.bookmarked} isAuthenticated={isAuthenticated} iconOnly />
        <ReportDialog
          contentType="post"
          contentId={post.id}
          isAuthenticated={isAuthenticated}
          trigger={
            <button type="button" className="btn btn--icon btn--sm" aria-label="إبلاغ">
              <Flag size={14} />
            </button>
          }
        />
      </div>
    </article>
  );
}
