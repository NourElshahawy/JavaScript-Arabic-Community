import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getNewsById } from "@/lib/data/news";
import { getComments } from "@/lib/data/comments";
import { BookmarkButton } from "@/components/post/BookmarkButton";
import { ShareButton } from "@/components/post/ShareButton";
import { ReportDialog } from "@/components/post/ReportDialog";
import { CommentSection } from "@/components/post/CommentSection";
import { timeAgo, formatCount } from "@/lib/format";

export async function generateMetadata({ params }) {
  const supabase = await createClient();
  const { news } = await getNewsById(supabase, params.id);
  if (!news) return {};
  return { title: news.title, description: news.summary };
}

export default async function NewsDetailPage({ params }) {
  const supabase = await createClient();
  const { user, profile } = await getCurrentUser();
  const { news } = await getNewsById(supabase, params.id, { userId: user?.id });

  if (!news || (news.status !== "approved" && news.submitted_by !== user?.id)) notFound();

  const { comments } = await getComments(supabase, "news", params.id);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <span className="content-type-label content-type-label--news">خبر · {news.source_name}</span>
      <h1>{news.title}</h1>
      <p className="post__body">{news.summary}</p>

      <a href={news.source_url} target="_blank" rel="noreferrer" className="btn btn--outline ltr" style={{ alignSelf: "flex-start" }}>
        <ExternalLink size={16} /> قراءة المصدر الأصلي
      </a>

      <div className="post__footer">
        <span className="action-btn" style={{ cursor: "default" }}>
          <Eye size={16} /> {formatCount(news.views_count)}
        </span>
        <ShareButton path={`/news/${news.id}`} />
        <span className="post__meta">{timeAgo(news.published_at ?? news.created_at)}</span>
        <span className="post__footer-spacer" />
        <BookmarkButton contentType="news" contentId={news.id} initialBookmarked={news.bookmarked} isAuthenticated={!!user} />
        <ReportDialog contentType="news" contentId={news.id} isAuthenticated={!!user} />
      </div>

      <CommentSection contentType="news" contentId={news.id} comments={comments} currentProfile={profile} />
    </div>
  );
}
