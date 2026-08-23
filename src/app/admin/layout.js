import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AdminNav } from "@/components/admin/AdminNav";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { EmptyState } from "@/components/ui/States";

export const metadata = { title: "لوحة التحكم" };

// Page-level gate for UX only (redirect non-admins away from the dashboard
// shell). The real enforcement is the "is_admin(auth.uid())" checks baked
// into every admin-only RLS policy in the database — this layout cannot be
// bypassed into real write access even if someone reached these routes
// directly, because Postgres would reject the mutation regardless.
export default async function AdminLayout({ children }) {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");

  if (!profile || profile.role !== "admin") {
    return (
      <div className="app-shell">
        <Navbar profile={profile} />
        <div className="admin-shell">
          <div className="card">
            <EmptyState icon={ShieldAlert} title="غير مصرّح بالوصول" description="هذه الصفحة مخصصة للمشرفين فقط." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar profile={profile} />
      <div className="admin-shell">
        <div>
          <h1 style={{ marginBottom: "var(--space-1)" }}>لوحة التحكم</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", marginBottom: "var(--space-4)" }}>
            إدارة المستخدمين والتقارير والمحتوى
          </p>
          <AdminNav />
        </div>
        {children}
      </div>
    </div>
  );
}
