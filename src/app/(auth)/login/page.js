"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/client";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Turnstile, isCaptchaEnabled } from "@/components/auth/Turnstile";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [serverError, setServerError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values) {
    setServerError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      ...values,
      options: { captchaToken: captchaToken || undefined },
    });

    if (error) {
      setServerError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <>
      <div className="auth-card__header">
        <span className="app-header__logo-mark">JS</span>
        <h1>تسجيل الدخول</h1>
        <p>أهلًا بعودتك إلى المجتمع</p>
      </div>

      <GoogleAuthButton />
      <div className="auth-divider">أو</div>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="البريد الإلكتروني" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" className="ltr" autoComplete="email" {...register("email")} error={!!errors.email} />
        </Field>

        <Field label="كلمة المرور" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" className="ltr" autoComplete="current-password" {...register("password")} error={!!errors.password} />
        </Field>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link href="/forgot-password" style={{ fontSize: "var(--text-sm)", color: "var(--color-brand)" }}>
            نسيت كلمة المرور؟
          </Link>
        </div>

        <Turnstile onVerify={setCaptchaToken} onExpire={() => setCaptchaToken("")} />

        {serverError ? <span className="field__error">{serverError}</span> : null}

        <Button type="submit" full disabled={isSubmitting || (isCaptchaEnabled && !captchaToken)}>
          {isSubmitting ? "جاري الدخول..." : "تسجيل الدخول"}
        </Button>
      </form>

      <p className="auth-footer-note">
        ليس لديك حساب؟ <Link href="/register">إنشاء حساب جديد</Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
