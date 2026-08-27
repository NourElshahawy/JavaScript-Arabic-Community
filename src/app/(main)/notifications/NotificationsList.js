"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Heart, UserPlus, MessageCircle, CheckCircle2, AtSign, Newspaper, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui/States";
import { timeAgo } from "@/lib/format";

const ICONS = {
  new_follower: UserPlus,
  question_answered: MessageCircle,
  answer_accepted: CheckCircle2,
  new_comment: MessageCircle,
  mention: AtSign,
  news_approved: Newspaper,
  interview_approved: Briefcase,
  like: Heart,
};

// Types where the message reads as "{actor} <action>". Types without an
// actor (e.g. news/interview approvals) just use the stored message as-is.
const ACTOR_LED_TYPES = new Set(["new_follower", "question_answered", "new_comment", "mention", "like"]);

function buildMessage(n) {
  const actorName = n.actor?.full_name;
  if (actorName && ACTOR_LED_TYPES.has(n.type)) {
    return `${actorName} ${n.message}`;
  }
  return n.message;
}

function targetHref(notification) {
  if (notification.content_type === "post") return `/posts/${notification.content_id}`;
  if (notification.content_type === "question") return `/questions/${notification.content_id}`;
  if (notification.content_type === "answer") return `/questions`;
  if (notification.content_type === "discussion") return `/discussions/${notification.content_id}`;
  if (notification.content_type === "news") return `/news/${notification.content_id}`;
  if (notification.content_type === "interview_experience") return `/interviews/${notification.content_id}`;
  return "#";
}

export function NotificationsList({ initialNotifications, userId }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("notifications-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => setNotifications((prev) => [payload.new, ...prev])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
  }

  function markOneRead(id, wasRead) {
    if (wasRead) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    const supabase = createClient();
    supabase.from("notifications").update({ is_read: true }).eq("id", id).then(() => {});
  }

  if (notifications.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={Bell} title="لا توجد إشعارات بعد" description="ستظهر هنا التفاعلات مع محتواك ومتابعوك الجدد." />
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "var(--space-3)" }}>
        <button type="button" className="btn btn--ghost btn--sm" onClick={markAllRead}>
          تعليم الكل كمقروء
        </button>
      </div>
      {notifications.map((n) => {
        const Icon = ICONS[n.type] || Bell;
        return (
          <Link
            key={n.id}
            href={targetHref(n)}
            onClick={() => markOneRead(n.id, n.is_read)}
            className="post notif-row"
            data-unread={!n.is_read}
            style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)" }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: "999px",
                background: n.is_read ? "var(--color-bg-muted)" : "var(--color-brand-subtle)",
                color: n.is_read ? "var(--color-text-muted)" : "var(--color-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={16} />
            </span>
            <span style={{ flex: 1, fontSize: "var(--text-sm)" }}>{buildMessage(n)}</span>
            <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)", whiteSpace: "nowrap" }}>
              {timeAgo(n.created_at)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
