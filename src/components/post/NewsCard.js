import Link from "next/link";
import Image from "next/image";
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

      {item.image_url ? (
        <div style={{ position: "relative", aspectRatio: "16 / 9", margin: "var(--space-2) 0", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <Image src={item.image_url} alt="" fill sizes="(max-width: 640px) 100vw, 600px" style={{ objectFit: "cover" }} />
        </div>
      ) : null}

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
