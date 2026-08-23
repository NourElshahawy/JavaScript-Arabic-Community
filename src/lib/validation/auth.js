import { z } from "zod";

const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "الاسم الكامل مطلوب"),
    username: z
      .string()
      .trim()
      .regex(usernamePattern, "اسم المستخدم يجب أن يكون بين 3-30 حرفًا إنجليزيًا أو رقمًا أو _"),
    email: z.string().trim().email("بريد إلكتروني غير صالح"),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("بريد إلكتروني غير صالح"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const profileSetupSchema = z.object({
  fullName: z.string().trim().min(2, "الاسم الكامل مطلوب"),
  username: z
    .string()
    .trim()
    .regex(usernamePattern, "اسم المستخدم يجب أن يكون بين 3-30 حرفًا إنجليزيًا أو رقمًا أو _"),
  bio: z.string().trim().max(280, "الوصف يجب ألا يتجاوز 280 حرفًا").optional().or(z.literal("")),
  location: z.string().trim().max(100).optional().or(z.literal("")),
  githubUrl: z.string().trim().url("رابط غير صالح").optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url("رابط غير صالح").optional().or(z.literal("")),
  websiteUrl: z.string().trim().url("رابط غير صالح").optional().or(z.literal("")),
});
