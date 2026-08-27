import Link from "next/link";
import { Plus } from "lucide-react";
import { SearchBox } from "@/components/layout/SearchBox";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";

export function Navbar({ profile, unreadCount = 0 }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link href="/" className="app-header__logo">
          <span className="app-header__logo-mark">JS</span>
          <span className="ltr">JS Arabic</span>
        </Link>

        <SearchBox />

        <div className="app-header__actions">
          <ThemeToggle />
          {profile ? (
            <>
              <Link href="/new/post">
                <Button variant="secondary" size="sm">
                  <Plus size={16} /> <span className="btn-label-md">إنشاء منشور</span>
                </Button>
              </Link>
              <NotificationBell initialCount={unreadCount} userId={profile.id} />
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
