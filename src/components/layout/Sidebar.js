"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, HelpCircle, MessagesSquare, Briefcase, Bookmark, Hash, Users, Trophy } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export const NAV_LINKS = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/news", label: "الأخبار", icon: Newspaper },
  { href: "/questions", label: "الأسئلة", icon: HelpCircle },
  { href: "/discussions", label: "النقاشات", icon: MessagesSquare },
  { href: "/interviews", label: "تجارب الانترفيو", icon: Briefcase },
  { href: "/leaderboard", label: "المتصدرون", icon: Trophy },
  { href: "/tags", label: "الوسوم", icon: Hash },
  { href: "/users", label: "المطورون", icon: Users },
  { href: "/bookmarks", label: "المحفوظات", icon: Bookmark },
];

export function Sidebar({ topTags = [], topUsers = [] }) {
  const pathname = usePathname();
  return (
    <div>
      <nav aria-label="التنقل الرئيسي" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="nav-link" data-active={pathname === href} title={label}>
            <Icon size={18} className="nav-link__icon" />
            <span className="nav-link__label">{label}</span>
          </Link>
        ))}
      </nav>

      {topTags.length > 0 ? (
        <div className="sidebar-widget">
          <span className="sidebar-widget__title">وسوم شائعة</span>
          {topTags.map((tag) => (
            <Link key={tag.id} href={`/tags/${tag.slug}`} className="sidebar-widget__row">
              <span>#{tag.name}</span>
              <span className="sidebar-widget__row-meta">{tag.usage_count}</span>
            </Link>
          ))}
        </div>
      ) : null}

      {topUsers.length > 0 ? (
        <div className="sidebar-widget">
          <span className="sidebar-widget__title">مطوّرون بارزون</span>
          {topUsers.map((u) => (
            <Link key={u.id} href={`/u/${u.username}`} className="sidebar-widget__row">
              <Avatar src={u.avatar_url} name={u.full_name} size="xs" />
              <span>{u.full_name}</span>
              <span className="sidebar-widget__row-meta">{u.reputation}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
