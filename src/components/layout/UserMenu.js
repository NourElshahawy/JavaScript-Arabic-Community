"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, ShieldCheck, User as UserIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";

export function UserMenu({ profile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="قائمة الحساب"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", borderRadius: "999px" }}
      >
        <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
      </button>
      {open ? (
        <div className="menu" style={{ insetInlineEnd: 0, top: "calc(100% + 8px)" }}>
          <Link href={`/u/${profile?.username}`} className="menu__item" onClick={() => setOpen(false)}>
            <UserIcon size={16} /> الملف الشخصي
          </Link>
          <Link href="/settings/profile" className="menu__item" onClick={() => setOpen(false)}>
            <Settings size={16} /> الإعدادات
          </Link>
          {profile?.role === "admin" ? (
            <Link href="/admin" className="menu__item" onClick={() => setOpen(false)}>
              <ShieldCheck size={16} /> لوحة التحكم
            </Link>
          ) : null}
          <div className="menu__separator" />
          <button type="button" className="menu__item menu__item--danger" onClick={handleLogout}>
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      ) : null}
    </div>
  );
}
