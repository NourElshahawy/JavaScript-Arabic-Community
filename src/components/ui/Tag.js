import Link from "next/link";

export function Tag({ children, href, className = "" }) {
  const classes = `tag ${className}`.trim();
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return <span className={classes}>{children}</span>;
}

export function TagList({ tags = [] }) {
  if (!tags.length) return null;
  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <Tag key={tag.slug ?? tag} href={`/tags/${tag.slug ?? tag}`}>
          {tag.name ?? tag}
        </Tag>
      ))}
    </div>
  );
}
