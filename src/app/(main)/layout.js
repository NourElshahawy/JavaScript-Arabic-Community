import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/Sidebar";
import { MainGrid } from "@/components/layout/MainGrid";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";

export default async function MainLayout({ children }) {
  const { user, profile } = await getCurrentUser();

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding/profile-setup");
  }

  let unreadCount = 0;
  if (user) {
    const supabase = await createClient();
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    unreadCount = count ?? 0;
  }

  const sidebarCollapsed = cookies().get("jsac-sidebar-collapsed")?.value === "1";

  return (
    <div className="app-shell">
      <Navbar profile={profile} unreadCount={unreadCount} />
      {profile && profile.status !== "active" ? (
        <div className="status-banner">
          {profile.status === "banned"
            ? "تم حظر حسابك. لا يمكنك النشر أو التعليق أو التصويت. تواصل مع فريق الإشراف إذا كنت تعتقد أن هذا خطأ."
            : "تم إيقاف حسابك مؤقتًا. لا يمكنك النشر أو التعليق أو التصويت حتى تتم إعادة تفعيله."}
        </div>
      ) : null}
      <MainGrid defaultCollapsed={sidebarCollapsed}>{children}</MainGrid>
      <BottomNav />
    </div>
  );
}
