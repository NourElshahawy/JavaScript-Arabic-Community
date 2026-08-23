import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { ErrorState } from "@/components/ui/States";
import { ProfileSetupForm } from "./ProfileSetupForm";

export const metadata = { title: "إعداد الملف الشخصي" };

export default async function ProfileSetupPage() {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login");

  // The profiles row is created by a database trigger right after signup.
  // If it hasn't landed yet (or the lookup failed), don't crash on
  // profile.* below — let the user retry instead.
  if (!profile) {
    return <ErrorState title="تعذّر تحميل ملفك الشخصي. حاول تحديث الصفحة." />;
  }

  return <ProfileSetupForm profile={profile} />;
}
