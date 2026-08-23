import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { NotificationsList } from "./NotificationsList";

export const metadata = { title: "الإشعارات" };

export default async function NotificationsPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login?next=/notifications");

  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, actor:profiles!notifications_actor_id_fkey(username, full_name, avatar_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 style={{ marginBottom: "var(--space-4)" }}>الإشعارات</h1>
      <NotificationsList initialNotifications={notifications ?? []} userId={user.id} />
    </div>
  );
}
