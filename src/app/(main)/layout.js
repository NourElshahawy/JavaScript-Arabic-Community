import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/Sidebar";
import { MainGrid } from "@/components/layout/MainGrid";
import { getCurrentUser } from "@/lib/supabase/current-user";

export default async function MainLayout({ children }) {
  const { profile } = await getCurrentUser();

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding/profile-setup");
  }

  return (
    <div className="app-shell">
      <Navbar profile={profile} />
      {profile && profile.status !== "active" ? (
        <div className="status-banner">
          {profile.status === "banned"
            ? "تم حظر حسابك. لا يمكنك النشر أو التعليق أو التصويت. تواصل مع فريق الإشراف إذا كنت تعتقد أن هذا خطأ."
            : "تم إيقاف حسابك مؤقتًا. لا يمكنك النشر أو التعليق أو التصويت حتى تتم إعادة تفعيله."}
        </div>
      ) : null}
      <MainGrid>{children}</MainGrid>
      <BottomNav />
    </div>
  );
}
