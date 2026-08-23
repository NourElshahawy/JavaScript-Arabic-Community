"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

const ROLE_VARIANT = { admin: "brand", moderator: "warning", member: "neutral" };
const ROLE_LABEL = { admin: "أدمن", moderator: "مشرف", member: "عضو" };
const STATUS_VARIANT = { active: "success", suspended: "warning", banned: "danger" };
const STATUS_LABEL = { active: "نشط", suspended: "موقوف", banned: "محظور" };

export function UsersTable({ initialUsers, currentUserId, badges = [] }) {
  const [users, setUsers] = useState(initialUsers);
  const [pendingId, setPendingId] = useState(null);
  const [badgeSelection, setBadgeSelection] = useState({});

  async function updateUser(userId, patch) {
    setPendingId(userId);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    if (!error) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...patch } : u)));
    }
    setPendingId(null);
  }

  async function handleAwardBadge(userId) {
    const badgeId = badgeSelection[userId];
    if (!badgeId) return;
    setPendingId(userId);
    const supabase = createClient();
    await supabase.from("user_badges").insert({ user_id: userId, badge_id: badgeId });
    setPendingId(null);
  }

  return (
    <div className="card admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>المستخدم</th>
            <th>الدور</th>
            <th>الحالة</th>
            <th>النقاط</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <Link href={`/u/${u.username}`} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Avatar src={u.avatar_url} name={u.full_name} size="sm" />
                  <span>
                    {u.full_name}
                    <span className="post__author-username ltr" style={{ display: "block" }}>
                      @{u.username}
                    </span>
                  </span>
                </Link>
              </td>
              <td>
                <Badge variant={ROLE_VARIANT[u.role]}>{ROLE_LABEL[u.role]}</Badge>
              </td>
              <td>
                <Badge variant={STATUS_VARIANT[u.status]}>{STATUS_LABEL[u.status]}</Badge>
              </td>
              <td>{u.reputation}</td>
              <td>
                <div className="admin-row-actions">
                  {u.id === currentUserId ? (
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>أنت</span>
                  ) : (
                    <>
                      {u.role !== "moderator" ? (
                        <button className="btn btn--outline btn--sm" disabled={pendingId === u.id} onClick={() => updateUser(u.id, { role: "moderator" })}>
                          تعيين مشرف
                        </button>
                      ) : (
                        <button className="btn btn--outline btn--sm" disabled={pendingId === u.id} onClick={() => updateUser(u.id, { role: "member" })}>
                          إلغاء الإشراف
                        </button>
                      )}
                      {u.status === "active" ? (
                        <button className="btn btn--outline btn--sm" disabled={pendingId === u.id} onClick={() => updateUser(u.id, { status: "suspended" })}>
                          إيقاف مؤقت
                        </button>
                      ) : (
                        <button className="btn btn--outline btn--sm" disabled={pendingId === u.id} onClick={() => updateUser(u.id, { status: "active" })}>
                          إلغاء الإيقاف
                        </button>
                      )}
                      {u.status !== "banned" ? (
                        <button className="btn btn--danger btn--sm" disabled={pendingId === u.id} onClick={() => updateUser(u.id, { status: "banned" })}>
                          حظر
                        </button>
                      ) : (
                        <button className="btn btn--outline btn--sm" disabled={pendingId === u.id} onClick={() => updateUser(u.id, { status: "active" })}>
                          رفع الحظر
                        </button>
                      )}
                    </>
                  )}
                  {badges.length ? (
                    <span style={{ display: "inline-flex", gap: "var(--space-1)" }}>
                      <select
                        className="select"
                        style={{ height: 30, fontSize: "var(--text-xs)" }}
                        value={badgeSelection[u.id] ?? ""}
                        onChange={(e) => setBadgeSelection((prev) => ({ ...prev, [u.id]: e.target.value }))}
                      >
                        <option value="">منح شارة...</option>
                        {badges.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <button className="btn btn--outline btn--sm" disabled={pendingId === u.id || !badgeSelection[u.id]} onClick={() => handleAwardBadge(u.id)}>
                        منح
                      </button>
                    </span>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
