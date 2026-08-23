"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const LEVELS = [
  { value: "intern", label: "متدرب" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

const DIFFICULTIES = [
  { value: "easy", label: "سهل" },
  { value: "medium", label: "متوسط" },
  { value: "hard", label: "صعب" },
];

function splitLines(value) {
  return value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function SubmitInterviewForm({ userId }) {
  const router = useRouter();
  const [form, setForm] = useState({
    company: "",
    position: "",
    experienceLevel: "junior",
    difficulty: "medium",
    rounds: "",
    questions: "",
    process: "",
    experience: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.company.trim() || !form.position.trim() || !form.experience.trim()) {
      setError("الشركة، المسمى الوظيفي، والتجربة الشخصية حقول مطلوبة.");
      return;
    }

    setSubmitting(true);
    setError("");
    const supabase = createClient();

    const { error: insertError } = await supabase.from("interview_experiences").insert({
      author_id: userId,
      company: form.company.trim(),
      position: form.position.trim(),
      experience_level: form.experienceLevel,
      difficulty: form.difficulty,
      rounds: splitLines(form.rounds),
      interview_questions: splitLines(form.questions),
      process_description: form.process.trim() || null,
      personal_experience: form.experience.trim(),
    });

    if (insertError) {
      setError("تعذّر إرسال التجربة، حاول مرة أخرى.");
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="card state-block">
        <div className="state-block__title">تم إرسال تجربتك للمراجعة</div>
        <p className="state-block__description">ستظهر التجربة في القسم العام بعد موافقة فريق الإشراف.</p>
        <Button variant="outline" onClick={() => router.push("/interviews")}>
          العودة إلى تجارب الانترفيو
        </Button>
      </div>
    );
  }

  return (
    <form className="auth-form card" onSubmit={handleSubmit} style={{ maxWidth: 640 }} noValidate>
      <Field label="الشركة" htmlFor="company">
        <Input id="company" value={form.company} onChange={update("company")} placeholder="Vodafone" />
      </Field>

      <Field label="المسمى الوظيفي" htmlFor="position">
        <Input id="position" value={form.position} onChange={update("position")} placeholder="Frontend Developer" />
      </Field>

      <Field label="مستوى الخبرة" htmlFor="experienceLevel">
        <select id="experienceLevel" className="select" value={form.experienceLevel} onChange={update("experienceLevel")}>
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="مستوى الصعوبة" htmlFor="difficulty">
        <select id="difficulty" className="select" value={form.difficulty} onChange={update("difficulty")}>
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="مراحل المقابلة" htmlFor="rounds" hint="سطر لكل مرحلة، مثال: HR ثم JavaScript ثم React">
        <Textarea id="rounds" rows={3} value={form.rounds} onChange={update("rounds")} />
      </Field>

      <Field label="أسئلة المقابلة" htmlFor="questions" hint="سطر لكل سؤال">
        <Textarea id="questions" rows={4} value={form.questions} onChange={update("questions")} />
      </Field>

      <Field label="وصف عملية المقابلة (اختياري)" htmlFor="process">
        <Textarea id="process" rows={3} value={form.process} onChange={update("process")} />
      </Field>

      <Field label="تجربتك الشخصية" htmlFor="experience">
        <Textarea id="experience" rows={6} value={form.experience} onChange={update("experience")} />
      </Field>

      {error ? <span className="field__error">{error}</span> : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? "جاري الإرسال..." : "إرسال للمراجعة"}
      </Button>
    </form>
  );
}
