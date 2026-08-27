import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUsers } from "@/lib/data/profiles";
import { EmptyState } from "@/components/ui/States";
import { LoadMoreList } from "@/components/ui/LoadMoreList";

export const metadata = { title: "المطورون" };

const PAGE_SIZE = 20;

export default async function UsersPage() {
  const supabase = await createClient();
  const { users } = await getUsers(supabase, { limit: PAGE_SIZE });

  return (
    <div>
      <h1 style={{ marginBottom: "var(--space-4)" }}>المطورون</h1>
      {!users.length ? (
        <div className="card">
          <EmptyState icon={Users} title="لا يوجد أعضاء بعد" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <LoadMoreList type="user" endpoint="/api/users" initialItems={users} initialHasMore={users.length === PAGE_SIZE} />
        </div>
      )}
    </div>
  );
}
