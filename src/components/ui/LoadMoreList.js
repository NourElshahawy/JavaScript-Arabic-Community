"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ArrowUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "@/components/post/PostCard";
import { QuestionCard } from "@/components/post/QuestionCard";
import { DiscussionCard } from "@/components/post/DiscussionCard";
import { NewsCard } from "@/components/post/NewsCard";
import { InterviewCard } from "@/components/post/InterviewCard";
import { UserRow } from "@/components/profile/UserRow";
import { Button } from "@/components/ui/Button";

function renderItem(type, item, extra) {
  switch (type) {
    case "post":
      return <PostCard post={item} isAuthenticated={extra.isAuthenticated} />;
    case "question":
      return <QuestionCard question={item} />;
    case "discussion":
      return <DiscussionCard discussion={item} />;
    case "news":
      return <NewsCard item={item} />;
    case "interview":
      return <InterviewCard interview={item} />;
    case "user":
      return <UserRow profile={item} />;
    default:
      return null;
  }
}

// Renders the first page (passed in from the server) plus a "load more"
// button that fetches subsequent pages from `endpoint` (one of the routes
// under src/app/api/*) and appends them client-side. For type="post" it
// also listens for newly-approved posts over Realtime and surfaces a "new
// posts" banner rather than silently reordering the list under the reader.
export function LoadMoreList({ type, endpoint, initialItems, initialHasMore, isAuthenticated = false }) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newCount, setNewCount] = useState(0);
  const topRef = useRef(null);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (type !== "post") return;

    const supabase = createClient();
    const channel = supabase
      .channel("home-feed-new-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts", filter: "status=eq.approved" },
        (payload) => {
          if (itemsRef.current.some((item) => item.id === payload.new.id)) return;
          setNewCount((n) => n + 1);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [type]);

  async function loadMore() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${endpoint}?offset=${items.length}`);
      if (!response.ok) throw new Error("request failed");
      const { items: nextItems, hasMore: nextHasMore } = await response.json();
      setItems((prev) => [...prev, ...nextItems]);
      setHasMore(nextHasMore);
    } catch {
      setError("تعذّر تحميل المزيد، حاول مرة أخرى.");
    }
    setLoading(false);
  }

  async function showNewPosts() {
    setLoading(true);
    try {
      const response = await fetch(`${endpoint}?offset=0`);
      if (!response.ok) throw new Error("request failed");
      const { items: freshItems } = await response.json();
      setItems((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        const toPrepend = freshItems.filter((item) => !existingIds.has(item.id));
        return [...toPrepend, ...current];
      });
      setNewCount(0);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setError("تعذّر تحميل المنشورات الجديدة.");
    }
    setLoading(false);
  }

  return (
    <>
      <div ref={topRef} />

      {newCount > 0 ? (
        <button
          type="button"
          onClick={showNewPosts}
          className="btn btn--primary btn--sm"
          style={{ display: "flex", margin: "0 auto var(--space-4)" }}
          disabled={loading}
        >
          <ArrowUp size={14} />
          {newCount === 1 ? "منشور جديد — اضغط للعرض" : `${newCount} منشورات جديدة — اضغط للعرض`}
        </button>
      ) : null}

      {items.map((item) => (
        <div key={item.id}>{renderItem(type, item, { isAuthenticated })}</div>
      ))}

      {hasMore ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-5) 0" }}>
          {error ? <span className="field__error">{error}</span> : null}
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : null}
            {loading ? "جاري التحميل..." : "تحميل المزيد"}
          </Button>
        </div>
      ) : null}
    </>
  );
}
