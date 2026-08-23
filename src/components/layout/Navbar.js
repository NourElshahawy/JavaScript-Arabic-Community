import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { SearchBox } from "@/components/layout/SearchBox";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/Button";

export function Navbar({ profile }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link href="/" className="app-header__logo">
          <span className="app-header__logo-mark">JS</span>
          <span className="ltr">JS Arabic</span>
        </Link>

        <SearchBox />

        <div className="app-header__actions">
          {profile ? (
            <>
              <Link href="/new/post">
                <Button variant="secondary" size="sm">
                  <Plus size={16} /> إنشاء منشور
                </Button>
              </Link>
              <Link href="/notifications" className="btn btn--icon" aria-label="الإشعارات">
                <Bell size={18} />
              </Link>
              <UserMenu profile={profile} />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn--ghost">
                تسجيل الدخول
              </Link>
              <Link href="/register" className="btn btn--primary">
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
