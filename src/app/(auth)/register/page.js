"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/client";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values) {
    setServerError("");
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName, username: values.username },
        emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding/profile-setup`,
      },
    });

    if (error) {
      setServerError(
        error.message.includes("already registered") ? "هذا البريد الإلكتروني مسجّل بالفعل." : "تعذّر إنشاء الحساب. حاول مرة أخرى."
      );
      return;
    }

    router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <>
      <div className="auth-card__header">
        <span className="app-header__logo-mark">JS</span>
        <h1>إنشاء حساب جديد</h1>
        <p>انضم إلى مجتمع مطوري JavaScript العرب</p>
      </div>

      <GoogleAuthButton label="التسجيل باستخدام Google" />
      <div className="auth-divider">أو</div>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="الاسم الكامل" htmlFor="fullName" error={errors.fullName?.message}>
          <Input id="fullName" autoComplete="name" {...register("fullName")} error={!!errors.fullName} />
        </Field>

        <Field label="اسم المستخدم" htmlFor="username" hint="حروف إنجليزية وأرقام و _ فقط" error={errors.username?.message}>
          <Input id="username" className="ltr" autoComplete="username" {...register("username")} error={!!errors.username} />
        </Field>

        <Field label="البريد الإلكتروني" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" className="ltr" autoComplete="email" {...register("email")} error={!!errors.email} />
        </Field>

        <Field label="كلمة المرور" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" className="ltr" autoComplete="new-password" {...register("password")} error={!!errors.password} />
        </Field>

        <Field label="تأكيد كلمة المرور" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input
            id="confirmPassword"
            type="password"
            className="ltr"
            autoComplete="new-password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
          />
        </Field>

        {serverError ? <span className="field__error">{serverError}</span> : null}

        <Button type="submit" full disabled={isSubmitting}>
          {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
        </Button>
      </form>

      <p className="auth-footer-note">
        لديك حساب بالفعل؟ <Link href="/login">تسجيل الدخول</Link>
      </p>
    </>
  );
}
