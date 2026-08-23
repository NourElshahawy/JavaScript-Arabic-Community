"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { VoteButton } from "@/components/post/VoteButton";
import { AcceptAnswerButton } from "@/components/post/AcceptAnswerButton";
import { timeAgo } from "@/lib/format";

export function AnswersSection({ question, answers, currentUser }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isQuestionAuthor = currentUser?.id === question.author_id;

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || !currentUser) return;

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("answers").insert({
      question_id: question.id,
      author_id: currentUser.id,
      body: trimmed,
    });

    if (!error) {
      setBody("");
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <h3>{answers.length} إجابة</h3>

      {answers.map((answer) => (
        <div key={answer.id} className="card" style={{ display: "flex", gap: "var(--space-4)", borderColor: answer.is_accepted ? "var(--color-accept)" : undefined }}>
          <VoteButton
            contentType="answer"
            contentId={answer.id}
            initialVote={answer.userVote}
            initialScore={answer.upvotes_count - answer.downvotes_count}
            isAuthenticated={!!currentUser}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="post__body">{answer.body}</p>
            <div className="post__footer">
              {isQuestionAuthor ? (
                <AcceptAnswerButton questionId={question.id} answerId={answer.id} isAccepted={answer.is_accepted} />
              ) : answer.is_accepted ? (
                <span className="action-btn" style={{ color: "var(--color-accept)", cursor: "default" }}>
                  <CheckCircle2 size={16} fill="currentColor" /> الإجابة المقبولة
                </span>
              ) : null}
              <span className="post__footer-spacer" />
              <Link href={`/u/${answer.author.username}`} className="post__author">
                <Avatar src={answer.author.avatar_url} name={answer.author.full_name} size="xs" />
                <span className="post__author-username ltr">@{answer.author.username}</span>
              </Link>
              <span className="post__meta">· {timeAgo(answer.created_at)}</span>
            </div>
          </div>
        </div>
      ))}

      {currentUser ? (
        <form onSubmit={handleSubmit} className="composer card">
          <div className="composer__row">
            <Avatar src={currentUser.avatar_url} name={currentUser.full_name} size="sm" />
            <textarea
              className="textarea"
              placeholder="اكتب إجابتك..."
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          <div className="composer__footer">
            <span className="composer__footer-spacer" />
            <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
              {submitting ? "جاري الإرسال..." : "إرسال الإجابة"}
            </Button>
          </div>
        </form>
      ) : (
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
          <Link href="/login" style={{ color: "var(--color-brand)" }}>
            سجّل الدخول
          </Link>{" "}
          للإجابة على هذا السؤال.
        </p>
      )}
    </section>
  );
}
