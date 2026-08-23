"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/client";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values) {
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="auth-card__header">
        <MailCheck size={32} strokeWidth={1.5} />
        <h1>تحقق من بريدك الإلكتروني</h1>
        <p>أرسلنا رابطًا لإعادة تعيين كلمة المرور إذا كان البريد مسجلًا لدينا.</p>
      </div>
    );
  }

  return (
    <>
      <div className="auth-card__header">
        <h1>نسيت كلمة المرور؟</h1>
        <p>أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة التعيين</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="البريد الإلكتروني" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" className="ltr" autoComplete="email" {...register("email")} error={!!errors.email} />
        </Field>

        <Button type="submit" full disabled={isSubmitting}>
          {isSubmitting ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
        </Button>
      </form>

      <p className="auth-footer-note">
        تذكرت كلمة المرور؟ <Link href="/login">تسجيل الدخول</Link>
      </p>
    </>
  );
}
