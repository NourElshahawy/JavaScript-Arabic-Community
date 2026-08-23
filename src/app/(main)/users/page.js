import Link from "next/link";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/States";

export const metadata = { title: "المطورون" };

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio, reputation")
    .order("reputation", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 style={{ marginBottom: "var(--space-4)" }}>المطورون</h1>
      {!profiles?.length ? (
        <div className="card">
          <EmptyState icon={Users} title="لا يوجد أعضاء بعد" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {profiles.map((p) => (
            <Link key={p.id} href={`/u/${p.username}`} className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <Avatar src={p.avatar_url} name={p.full_name} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: "var(--weight-semibold)" }}>{p.full_name}</div>
                <div className="post__author-username ltr">@{p.username}</div>
              </div>
              <span style={{ marginInlineStart: "auto", color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                {p.reputation} نقطة
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
