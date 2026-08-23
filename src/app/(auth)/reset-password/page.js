"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/client";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values) {
    setServerError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      setServerError("تعذّر تحديث كلمة المرور. جرّب طلب رابط جديد.");
      return;
    }

    router.push("/login?reset=success");
  }

  return (
    <>
      <div className="auth-card__header">
        <h1>تعيين كلمة مرور جديدة</h1>
        <p>اختر كلمة مرور قوية لحسابك</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="كلمة المرور الجديدة" htmlFor="password" error={errors.password?.message}>
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
          {isSubmitting ? "جاري الحفظ..." : "حفظ كلمة المرور"}
        </Button>
      </form>
    </>
  );
}
