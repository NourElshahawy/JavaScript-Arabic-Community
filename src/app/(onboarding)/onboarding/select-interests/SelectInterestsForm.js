"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function SelectInterestsForm({ tags, userId }) {
  const router = useRouter();
  const [selected, setSelected] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggle(tagId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    const supabase = createClient();

    if (selected.size > 0) {
      const rows = Array.from(selected).map((tagId) => ({ user_id: userId, tag_id: tagId }));
      const { error: interestsError } = await supabase.from("user_interests").insert(rows);
      if (interestsError) {
        setError("تعذّر حفظ الاهتمامات، حاول مرة أخرى.");
        setSubmitting(false);
        return;
      }
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);

    if (profileError) {
      setError("تعذّر إكمال الإعداد، حاول مرة أخرى.");
      setSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <>
      <div className="auth-card__header">
        <h1>اختر اهتماماتك</h1>
        <p>خطوة 2 من 2 — سيساعدنا هذا في تخصيص المحتوى الذي تراه</p>
      </div>

      <div className="interest-grid">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            className="interest-chip"
            data-selected={selected.has(tag.id)}
            onClick={() => toggle(tag.id)}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {error ? <span className="field__error">{error}</span> : null}

      <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-5)" }}>
        <Button variant="ghost" onClick={handleSubmit} disabled={submitting}>
          تخطي
        </Button>
        <Button full onClick={handleSubmit} disabled={submitting}>
          {submitting ? "جاري الحفظ..." : `متابعة${selected.size ? ` (${selected.size})` : ""}`}
        </Button>
      </div>
    </>
  );
}
