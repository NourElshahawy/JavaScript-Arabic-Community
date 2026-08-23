"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/users", label: "المستخدمون" },
  { href: "/admin/reports", label: "التقارير" },
  { href: "/admin/news", label: "الأخبار" },
  { href: "/admin/interviews", label: "تجارب الانترفيو" },
  { href: "/admin/tags", label: "الوسوم" },
  { href: "/admin/posts", label: "المنشورات" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="تنقل لوحة التحكم">
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href} className="admin-nav__item" data-active={pathname === tab.href}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
