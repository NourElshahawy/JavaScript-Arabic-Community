import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { MainGrid } from "@/components/layout/MainGrid";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";

export default async function MainLayout({ children }) {
  const { user, profile } = await getCurrentUser();

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding/profile-setup");
  }

  const supabase = await createClient();

  const [unread, topTagsRes, topUsersRes] = await Promise.all([
    user
      ? supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false)
      : Promise.resolve({ count: 0 }),
    supabase.from("tags").select("id, name, slug, usage_count").order("usage_count", { ascending: false }).limit(6),
    supabase.from("profiles").select("id, username, full_name, avatar_url, reputation").order("reputation", { ascending: false }).limit(5),
  ]);

  const unreadCount = unread.count ?? 0;
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
      <MainGrid defaultCollapsed={sidebarCollapsed} topTags={topTagsRes.data ?? []} topUsers={topUsersRes.data ?? []}>
        {children}
      </MainGrid>
    </div>
  );
}
