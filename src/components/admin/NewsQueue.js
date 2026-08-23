"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui/States";
import { Inbox } from "lucide-react";
import { timeAgo } from "@/lib/format";

export function NewsQueue({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [pendingId, setPendingId] = useState(null);

  async function handleApprove(id) {
    setPendingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("news").update({ status: "approved", published_at: new Date().toISOString() }).eq("id", id);
    if (!error) setItems((prev) => prev.filter((i) => i.id !== id));
    setPendingId(null);
  }

  async function handleReject(id) {
    setPendingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("news").update({ status: "rejected" }).eq("id", id);
    if (!error) setItems((prev) => prev.filter((i) => i.id !== id));
    setPendingId(null);
  }

  if (items.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={Inbox} title="لا توجد أخبار قيد المراجعة" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {items.map((item) => (
        <div key={item.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)" }}>
            <div>
              <h3>{item.title}</h3>
              <p style={{ color: "var(--color-text-secondary)" }}>{item.summary}</p>
              <a href={item.source_url} target="_blank" rel="noreferrer" className="ltr" style={{ color: "var(--color-brand)", fontSize: "var(--text-sm)" }}>
                {item.source_url}
              </a>
              <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)", marginTop: 4 }}>
                بواسطة <Link href={`/u/${item.submitter?.username}`}>@{item.submitter?.username}</Link> · {timeAgo(item.created_at)}
              </div>
            </div>
            <div className="admin-row-actions" style={{ flexShrink: 0 }}>
              <button className="btn btn--primary btn--sm" disabled={pendingId === item.id} onClick={() => handleApprove(item.id)}>
                موافقة
              </button>
              <button className="btn btn--outline btn--sm" disabled={pendingId === item.id} onClick={() => handleReject(item.id)}>
                رفض
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
