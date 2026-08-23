"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { attachTags } from "@/lib/tags";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function AskQuestionForm({ userId }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (title.trim().length < 10) {
      setError("العنوان يجب أن يكون 10 أحرف على الأقل.");
      return;
    }
    if (!body.trim()) {
      setError("محتوى السؤال مطلوب.");
      return;
    }

    setSubmitting(true);
    setError("");
    const supabase = createClient();

    const { data: question, error: insertError } = await supabase
      .from("questions")
      .insert({ author_id: userId, title: title.trim(), body: body.trim() })
      .select("id")
      .single();

    if (insertError || !question) {
      setError("تعذّر نشر السؤال، حاول مرة أخرى.");
      setSubmitting(false);
      return;
    }

    if (tagsInput.trim()) {
      await attachTags(supabase, "question", question.id, tagsInput);
    }

    router.push(`/questions/${question.id}`);
  }

  return (
    <form className="auth-form card" onSubmit={handleSubmit} style={{ maxWidth: 640 }} noValidate>
      <Field label="عنوان السؤال" htmlFor="title" hint="اشرح المشكلة في جملة واحدة واضحة">
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ليه الـ Closure بيحتفظ بالـ variables بعد انتهاء الـ execution context؟" />
      </Field>

      <Field label="تفاصيل السؤال" htmlFor="body" hint="أضف السياق، وأي كود متعلق بالمشكلة">
        <Textarea id="body" rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>

      <Field label="الوسوم" htmlFor="tags" hint="افصل بينها بفاصلة، مثال: javascript, closures">
        <Input id="tags" className="ltr" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </Field>

      {error ? <span className="field__error">{error}</span> : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? "جاري النشر..." : "نشر السؤال"}
      </Button>
    </form>
  );
}
