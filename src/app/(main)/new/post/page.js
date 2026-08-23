import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { PostComposer } from "@/components/post/PostComposer";
import { ErrorState } from "@/components/ui/States";

export const metadata = { title: "إنشاء منشور" };

export default async function NewPostPage() {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/new/post");

  return (
    <div>
      <h1 style={{ marginBottom: "var(--space-4)" }}>إنشاء منشور</h1>
      {profile ? <PostComposer profile={profile} /> : <ErrorState title="تعذّر تحميل ملفك الشخصي. حاول تحديث الصفحة." />}
    </div>
  );
}
