import Link from "next/link";

// Topic chips for a list section (news / questions / discussions / feed).
// Clicking a chip sets ?tag=<slug>; clicking the active one clears it.
// `keep` carries any companion params (e.g. sort) across the navigation.
export function TagFilterBar({ basePath, tags, active, keep = {} }) {
  if (!tags?.length) return null;

  const hrefFor = (slug) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(keep)) if (v) params.set(k, v);
    if (slug) params.set("tag", slug);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="tag-filter" role="group" aria-label="تصفية حسب الوسم">
      <Link href={hrefFor(null)} className="tag" data-active={!active}>
        الكل
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={active === tag.slug ? hrefFor(null) : hrefFor(tag.slug)}
          className="tag"
          data-active={active === tag.slug}
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
