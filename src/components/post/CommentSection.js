"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { RichText } from "@/components/ui/RichText";
import { DeleteButton } from "@/components/content/DeleteButton";
import { timeAgo } from "@/lib/format";

// One level of nesting (matches the schema: comments.parent_comment_id).
// Local state is the source of truth so replies / edits / deletes show
// immediately; router.refresh() then reconciles counts server-side.
export function CommentSection({ contentType, contentId, comments: initialComments, currentProfile }) {
  const router = useRouter();
  const toast = useToast();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const isAdmin = currentProfile?.role === "admin";

  const { roots, repliesByParent } = useMemo(() => {
    const roots = [];
    const repliesByParent = new Map();
    for (const c of comments) {
      if (c.parent_comment_id) {
        if (!repliesByParent.has(c.parent_comment_id)) repliesByParent.set(c.parent_comment_id, []);
        repliesByParent.get(c.parent_comment_id).push(c);
      } else {
        roots.push(c);
      }
    }
    return { roots, repliesByParent };
  }, [comments]);

  async function addComment(text, parentId) {
    const trimmed = text.trim();
    if (!trimmed || !currentProfile) return false;
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("comments")
      .insert({
        author_id: currentProfile.id,
        content_type: contentType,
        content_id: contentId,
        parent_comment_id: parentId ?? null,
        body: trimmed,
      })
      .select("id, body, created_at, parent_comment_id, author_id")
      .single();

    if (insertError || !data) {
      toast(errorMessage(insertError, "تعذّر إضافة التعليق."), { type: "error" });
      return false;
    }
    setComments((list) => [
      ...list,
      {
        ...data,
        author: {
          id: currentProfile.id,
          username: currentProfile.username,
          full_name: currentProfile.full_name,
          avatar_url: currentProfile.avatar_url,
        },
      },
    ]);
    router.refresh();
    return true;
  }

  async function handleRootSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const ok = await addComment(body);
    if (ok) setBody("");
    setSubmitting(false);
  }

  async function saveEdit(id, text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("comments")
      .update({ body: trimmed, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) {
      toast(errorMessage(updateError, "تعذّر حفظ التعديل."), { type: "error" });
      return;
    }
    setComments((list) => list.map((c) => (c.id === id ? { ...c, body: trimmed } : c)));
    setEditingId(null);
    toast("تم الحفظ.", { type: "success" });
  }

  function removeLocally(id) {
    setComments((list) => list.filter((c) => c.id !== id && c.parent_comment_id !== id));
    router.refresh();
  }

  const total = comments.length;

  return (
    <section id="comments" style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <h3>التعليقات ({total})</h3>

      {currentProfile ? (
        <form onSubmit={handleRootSubmit} className="composer" style={{ marginBottom: "var(--space-3)" }}>
          <div className="composer__row">
            <Avatar src={currentProfile.avatar_url} name={currentProfile.full_name} size="sm" />
            <textarea
              className="textarea"
              placeholder="أضف تعليقًا... (يدعم ``` للكود)"
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

      {roots.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>لا توجد تعليقات بعد. كن أول من يعلّق.</p>
      ) : (
        <div>
          {roots.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              replies={repliesByParent.get(comment.id) ?? []}
              currentProfile={currentProfile}
              isAdmin={isAdmin}
              editingId={editingId}
              setEditingId={setEditingId}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onSaveEdit={saveEdit}
              onReply={addComment}
              onDeleted={removeLocally}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CommentNode({
  comment,
  replies = [],
  currentProfile,
  isAdmin,
  editingId,
  setEditingId,
  replyingTo,
  setReplyingTo,
  onSaveEdit,
  onReply,
  onDeleted,
  isReply = false,
}) {
  const [editText, setEditText] = useState(comment.body);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const canModify = currentProfile?.id === comment.author_id;
  const canDelete = canModify || isAdmin;
  const isEditing = editingId === comment.id;
  const isReplying = replyingTo === comment.id;

  async function submitReply(event) {
    event.preventDefault();
    setSendingReply(true);
    const ok = await onReply(replyText, comment.id);
    setSendingReply(false);
    if (ok) {
      setReplyText("");
      setReplyingTo(null);
    }
  }

  return (
    <div className="comment">
      <Avatar src={comment.author.avatar_url} name={comment.author.full_name} size="sm" />
      <div className="comment__body">
        <div className="comment__bubble">
          <div className="comment__header">
            <Link href={`/u/${comment.author.username}`} className="comment__name">
              {comment.author.full_name}
            </Link>
            <span className="comment__time">{timeAgo(comment.created_at)}</span>
          </div>
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveEdit(comment.id, editText);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}
            >
              <textarea className="textarea" rows={2} value={editText} onChange={(e) => setEditText(e.target.value)} />
              <div style={{ display: "flex", gap: "var(--space-1)" }}>
                <Button type="submit" size="sm">
                  حفظ
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                  إلغاء
                </Button>
              </div>
            </form>
          ) : (
            <RichText text={comment.body} />
          )}
        </div>

        {!isEditing ? (
          <div className="comment__actions">
            {currentProfile && !isReply ? (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setReplyingTo(isReplying ? null : comment.id)}>
                رد
              </button>
            ) : null}
            {canModify ? (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditingId(comment.id)}>
                <Pencil size={13} /> تعديل
              </button>
            ) : null}
            {canDelete ? <DeleteButton table="comments" id={comment.id} variant="inline" label="حذف" onDeleted={() => onDeleted(comment.id)} /> : null}
          </div>
        ) : null}

        {isReplying ? (
          <form onSubmit={submitReply} className="comment__reply-form" style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <textarea
              className="textarea"
              rows={2}
              placeholder={`رد على ${comment.author.full_name}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div style={{ display: "flex", gap: "var(--space-1)" }}>
              <Button type="submit" size="sm" disabled={sendingReply || !replyText.trim()}>
                {sendingReply ? "..." : "إرسال الرد"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                إلغاء
              </Button>
            </div>
          </form>
        ) : null}

        {replies.length > 0 ? (
          <div className="comment__replies">
            {replies.map((reply) => (
              <CommentNode
                key={reply.id}
                comment={reply}
                currentProfile={currentProfile}
                isAdmin={isAdmin}
                editingId={editingId}
                setEditingId={setEditingId}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                onSaveEdit={onSaveEdit}
                onReply={onReply}
                onDeleted={onDeleted}
                isReply
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
