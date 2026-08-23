import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { UsersTable } from "@/components/admin/UsersTable";

export const metadata = { title: "المستخدمون · لوحة التحكم" };

export default async function AdminUsersPage() {
  const { user } = await getCurrentUser();
  const supabase = await createClient();
  const [{ data: users }, { data: badges }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, role, status, reputation")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("badges").select("id, slug, name").order("name"),
  ]);

  return <UsersTable initialUsers={users ?? []} currentUserId={user.id} badges={badges ?? []} />;
}
