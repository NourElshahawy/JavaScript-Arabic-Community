"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { attachTags } from "@/lib/tags";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function SubmitNewsForm({ userId }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", summary: "", sourceUrl: "", sourceName: "", imageUrl: "", tags: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || !form.sourceUrl.trim() || !form.sourceName.trim()) {
      setError("كل الحقول ما عدا الصورة والوسوم مطلوبة.");
      return;
    }

    setSubmitting(true);
    setError("");
    const supabase = createClient();

    const { data: news, error: insertError } = await supabase
      .from("news")
      .insert({
        submitted_by: userId,
        title: form.title.trim(),
        summary: form.summary.trim(),
        source_url: form.sourceUrl.trim(),
        source_name: form.sourceName.trim(),
        image_url: form.imageUrl.trim() || null,
      })
      .select("id")
      .single();

    if (insertError || !news) {
      setError("تعذّر إرسال الخبر، حاول مرة أخرى.");
      setSubmitting(false);
      return;
    }

    if (form.tags.trim()) {
      await attachTags(supabase, "news", news.id, form.tags);
    }

    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="card state-block">
        <div className="state-block__title">تم إرسال الخبر للمراجعة</div>
        <p className="state-block__description">سيظهر الخبر في القسم العام بعد موافقة فريق الإشراف.</p>
        <Button variant="outline" onClick={() => router.push("/news")}>
          العودة إلى الأخبار
        </Button>
      </div>
    );
  }

  return (
    <form className="auth-form card" onSubmit={handleSubmit} style={{ maxWidth: 640 }} noValidate>
      <Field label="العنوان" htmlFor="title">
        <Input id="title" value={form.title} onChange={update("title")} />
      </Field>

      <Field label="ملخص الخبر" htmlFor="summary" hint="لا تنسخ المقال كاملاً — اكتب ملخصًا موجزًا واحفظ حقوق المصدر">
        <Textarea id="summary" rows={4} value={form.summary} onChange={update("summary")} />
      </Field>

      <Field label="رابط المصدر" htmlFor="sourceUrl">
        <Input id="sourceUrl" className="ltr" type="url" placeholder="https://..." value={form.sourceUrl} onChange={update("sourceUrl")} />
      </Field>

      <Field label="اسم المصدر" htmlFor="sourceName">
        <Input id="sourceName" placeholder="V8 Blog، Node.js Blog، ..." value={form.sourceName} onChange={update("sourceName")} />
      </Field>

      <Field label="رابط صورة (اختياري)" htmlFor="imageUrl">
        <Input id="imageUrl" className="ltr" type="url" value={form.imageUrl} onChange={update("imageUrl")} />
      </Field>

      <Field label="الوسوم" htmlFor="tags" hint="افصل بينها بفاصلة">
        <Input id="tags" className="ltr" value={form.tags} onChange={update("tags")} />
      </Field>

      {error ? <span className="field__error">{error}</span> : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? "جاري الإرسال..." : "إرسال للمراجعة"}
      </Button>
    </form>
  );
}
