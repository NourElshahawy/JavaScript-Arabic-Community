"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, HelpCircle, MessagesSquare, Briefcase, Bookmark, Hash, Users, Trophy } from "lucide-react";

const LINKS = [
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

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="التنقل الرئيسي" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="nav-link" data-active={pathname === href}>
          <Icon size={18} className="nav-link__icon" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const items = [LINKS[0], LINKS[1], LINKS[2], LINKS[4], LINKS[7]];
  return (
    <nav className="bottom-nav" aria-label="التنقل السريع">
      {items.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="bottom-nav__item" data-active={pathname === href}>
          <Icon size={20} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
