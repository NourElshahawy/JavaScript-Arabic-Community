import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { ErrorState } from "@/components/ui/States";
import { EditProfileForm } from "./EditProfileForm";

export const metadata = { title: "إعدادات الملف الشخصي" };

export default async function EditProfilePage() {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/settings/profile");

  return (
    <div>
      <h1 style={{ marginBottom: "var(--space-4)" }}>إعدادات الملف الشخصي</h1>
      {profile ? <EditProfileForm profile={profile} /> : <ErrorState title="تعذّر تحميل ملفك الشخصي. حاول تحديث الصفحة." />}
    </div>
  );
}
