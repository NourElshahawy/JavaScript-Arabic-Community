import Link from "next/link";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/States";

export const metadata = { title: "قائمة المتصدرين" };

const MEDAL_COLOR = ["#d4af37", "#a8a8a8", "#b06a2f"];

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, reputation")
    .order("reputation", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 style={{ marginBottom: "var(--space-1)" }}>قائمة المتصدرين</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", marginBottom: "var(--space-4)" }}>
        الأعضاء الأعلى نقاطًا في المجتمع
      </p>

      {!profiles?.length ? (
        <div className="card">
          <EmptyState icon={Trophy} title="لا يوجد أعضاء بعد" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {profiles.map((p, i) => (
            <Link
              key={p.id}
              href={`/u/${p.username}`}
              className="card"
              style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
            >
              <span
                style={{
                  width: 28,
                  textAlign: "center",
                  fontWeight: "var(--weight-semibold)",
                  color: i < 3 ? MEDAL_COLOR[i] : "var(--color-text-muted)",
                }}
              >
                {i + 1}
              </span>
              <Avatar src={p.avatar_url} name={p.full_name} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: "var(--weight-semibold)" }}>{p.full_name}</div>
                <div className="post__author-username ltr">@{p.username}</div>
              </div>
              <span style={{ marginInlineStart: "auto", fontWeight: "var(--weight-semibold)" }}>{p.reputation}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
