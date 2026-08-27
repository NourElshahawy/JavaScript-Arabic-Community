import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

export function UserRow({ profile }) {
  return (
    <Link href={`/u/${profile.username}`} className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
      <Avatar src={profile.avatar_url} name={profile.full_name} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: "var(--weight-semibold)" }}>{profile.full_name}</div>
        <div className="post__author-username ltr">@{profile.username}</div>
      </div>
      <span style={{ marginInlineStart: "auto", color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
        {profile.reputation} نقطة
      </span>
    </Link>
  );
}
