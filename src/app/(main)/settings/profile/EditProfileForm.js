"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSetupSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/client";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AvatarUploader } from "@/components/auth/AvatarUploader";

export function EditProfileForm({ profile }) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      fullName: profile.full_name ?? "",
      username: profile.username ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      githubUrl: profile.github_url ?? "",
      linkedinUrl: profile.linkedin_url ?? "",
      websiteUrl: profile.website_url ?? "",
    },
  });

  async function onSubmit(values) {
    setServerError("");
    setSaved(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        username: values.username,
        bio: values.bio || null,
        location: values.location || null,
        github_url: values.githubUrl || null,
        linkedin_url: values.linkedinUrl || null,
        website_url: values.websiteUrl || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", profile.id);

    if (error) {
      setServerError(
        error.message.includes("username") ? "اسم المستخدم هذا مستخدم بالفعل." : "تعذّر حفظ البيانات، حاول مرة أخرى."
      );
      return;
    }

    setSaved(true);
    router.refresh();
    if (values.username !== profile.username) {
      router.push(`/u/${values.username}`);
    }
  }

  return (
    <form className="auth-form card" onSubmit={handleSubmit(onSubmit)} noValidate style={{ maxWidth: 480 }}>
      <AvatarUploader userId={profile?.id} name={profile?.full_name} initialUrl={avatarUrl} onUploaded={setAvatarUrl} />
      <Field label="الاسم الكامل" htmlFor="fullName" error={errors.fullName?.message}>
        <Input id="fullName" {...register("fullName")} error={!!errors.fullName} />
      </Field>

      <Field label="اسم المستخدم" htmlFor="username" error={errors.username?.message}>
        <Input id="username" className="ltr" {...register("username")} error={!!errors.username} />
      </Field>

      <Field label="نبذة عنك" htmlFor="bio" hint="اختياري، حتى 280 حرفًا" error={errors.bio?.message}>
        <Textarea id="bio" rows={3} {...register("bio")} error={!!errors.bio} />
      </Field>

      <Field label="الموقع الجغرافي" htmlFor="location" error={errors.location?.message}>
        <Input id="location" {...register("location")} error={!!errors.location} />
      </Field>

      <Field label="GitHub" htmlFor="githubUrl" error={errors.githubUrl?.message}>
        <Input id="githubUrl" className="ltr" {...register("githubUrl")} error={!!errors.githubUrl} />
      </Field>

      <Field label="LinkedIn" htmlFor="linkedinUrl" error={errors.linkedinUrl?.message}>
        <Input id="linkedinUrl" className="ltr" {...register("linkedinUrl")} error={!!errors.linkedinUrl} />
      </Field>

      <Field label="الموقع الشخصي" htmlFor="websiteUrl" error={errors.websiteUrl?.message}>
        <Input id="websiteUrl" className="ltr" {...register("websiteUrl")} error={!!errors.websiteUrl} />
      </Field>

      {serverError ? <span className="field__error">{serverError}</span> : null}
      {saved ? <span style={{ color: "var(--color-success)", fontSize: "var(--text-sm)" }}>تم الحفظ.</span> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
      </Button>
    </form>
  );
}
