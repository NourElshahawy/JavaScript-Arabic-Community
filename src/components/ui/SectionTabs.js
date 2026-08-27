import Link from "next/link";

// Query-param tab bar for server-rendered lists (feed type, sort order,
// profile section). The first tab is the default and is rendered without
// the query param. `keep` carries companion params (e.g. an active tag
// filter) across the navigation.
export function SectionTabs({ basePath, param, current, tabs, keep = {}, label = "تصفية" }) {
  const hrefFor = (key) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(keep)) if (v) params.set(k, v);
    if (key) params.set(param, key);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav className="section-tabs" aria-label={label}>
      {tabs.map((tab, index) => {
        const active = (current ?? tabs[0].key) === tab.key;
        return (
          <Link key={tab.key} href={hrefFor(index === 0 ? null : tab.key)} className="section-tabs__item" data-active={active}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
