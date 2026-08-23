import Link from "next/link";
import { ExternalLink, MessageCircle } from "lucide-react";
import { timeAgo, formatCount } from "@/lib/format";

export function NewsCard({ item }) {
  return (
    <article className="post">
      <span className="content-type-label content-type-label--news">خبر · {item.source_name}</span>
      <Link href={`/news/${item.id}`}>
        <h3 className="post__title" style={{ marginTop: 4 }}>
          {item.title}
        </h3>
      </Link>
      <p className="post__body">{item.summary}</p>

      <div className="post__footer">
        <a href={item.source_url} target="_blank" rel="noreferrer" className="action-btn ltr">
          <ExternalLink size={14} /> المصدر
        </a>
        <Link href={`/news/${item.id}#comments`} className="action-btn">
          <MessageCircle size={14} />
          {item.comments_count > 0 ? formatCount(item.comments_count) : "تعليق"}
        </Link>
        <span className="post__footer-spacer" />
        <span className="post__meta">{timeAgo(item.published_at)}</span>
      </div>
    </article>
  );
}
