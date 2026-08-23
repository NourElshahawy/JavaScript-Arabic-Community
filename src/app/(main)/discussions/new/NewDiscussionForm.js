"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { attachTags } from "@/lib/tags";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function NewDiscussionForm({ userId }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (title.trim().length < 5) {
      setError("العنوان يجب أن يكون 5 أحرف على الأقل.");
      return;
    }
    if (!body.trim()) {
      setError("محتوى النقاش مطلوب.");
      return;
    }

    setSubmitting(true);
    setError("");
    const supabase = createClient();

    const { data: discussion, error: insertError } = await supabase
      .from("discussions")
      .insert({ author_id: userId, title: title.trim(), body: body.trim() })
      .select("id")
      .single();

    if (insertError || !discussion) {
      setError("تعذّر نشر النقاش، حاول مرة أخرى.");
      setSubmitting(false);
      return;
    }

    if (tagsInput.trim()) {
      await attachTags(supabase, "discussion", discussion.id, tagsInput);
    }

    router.push(`/discussions/${discussion.id}`);
  }

  return (
    <form className="auth-form card" onSubmit={handleSubmit} style={{ maxWidth: 640 }} noValidate>
      <Field label="عنوان النقاش" htmlFor="title">
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="هل Frontend Developer محتاج يتعلم TypeScript في 2026؟" />
      </Field>

      <Field label="التفاصيل" htmlFor="body">
        <Textarea id="body" rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>

      <Field label="الوسوم" htmlFor="tags" hint="افصل بينها بفاصلة">
        <Input id="tags" className="ltr" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </Field>

      {error ? <span className="field__error">{error}</span> : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? "جاري النشر..." : "نشر النقاش"}
      </Button>
    </form>
  );
}
