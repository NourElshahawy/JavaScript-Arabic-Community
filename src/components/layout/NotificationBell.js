"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Bell + unread badge. Seeds from a server-computed count, then keeps it
// live over the same Realtime channel the notifications page uses. The
// count clears once the user is on /notifications (where "mark all read"
// and per-row read already run).
export function NotificationBell({ initialCount = 0, userId }) {
  const pathname = usePathname();
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (pathname === "/notifications") setCount(0);
  }, [pathname]);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const channel = supabase
      .channel("navbar-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => setCount((c) => c + 1)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  return (
    <Link href="/notifications" className="btn btn--icon bell" aria-label={count > 0 ? `الإشعارات (${count} غير مقروء)` : "الإشعارات"}>
      <Bell size={18} />
      {count > 0 ? <span className="bell__badge">{count > 9 ? "9+" : count}</span> : null}
    </Link>
  );
}
