"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/errors";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/format";

export function CommentSection({ contentType, contentId, comments, currentProfile }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || !currentProfile) return;

    setSubmitting(true);
    setError("");
    const supabase = createClient();
    const { error: insertError } = await supabase.from("comments").insert({
      author_id: currentProfile.id,
      content_type: contentType,
      content_id: contentId,
      body: trimmed,
    });

    if (insertError) {
      setError(errorMessage(insertError, "تعذّر إضافة التعليق، حاول مرة أخرى."));
    } else {
      setBody("");
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <section id="comments" style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <h3>التعليقات ({comments.length})</h3>

      {currentProfile ? (
        <form onSubmit={handleSubmit} className="composer" style={{ marginBottom: "var(--space-3)" }}>
          <div className="composer__row">
            <Avatar src={currentProfile.avatar_url} name={currentProfile.full_name} size="sm" />
            <textarea
              className="textarea"
              placeholder="أضف تعليقًا..."
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          {error ? <span className="field__error">{error}</span> : null}
          <div className="composer__footer">
            <span className="composer__footer-spacer" />
            <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
              {submitting ? "جاري الإرسال..." : "إرسال"}
            </Button>
          </div>
        </form>
      ) : (
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
          <Link href="/login" style={{ color: "var(--color-brand)" }}>
            سجّل الدخول
          </Link>{" "}
          لإضافة تعليق.
        </p>
      )}

      {comments.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>لا توجد تعليقات بعد. كن أول من يعلّق.</p>
      ) : (
        <div>
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <Avatar src={comment.author.avatar_url} name={comment.author.full_name} size="sm" />
              <div className="comment__body">
                <div className="comment__bubble">
                  <div className="comment__header">
                    <Link href={`/u/${comment.author.username}`} className="comment__name">
                      {comment.author.full_name}
                    </Link>
                    <span className="comment__time">{timeAgo(comment.created_at)}</span>
                  </div>
                  <p style={{ margin: 0, color: "var(--color-text)", whiteSpace: "pre-wrap" }}>{comment.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
