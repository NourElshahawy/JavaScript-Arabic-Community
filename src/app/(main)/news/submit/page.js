import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { SubmitNewsForm } from "./SubmitNewsForm";

export const metadata = { title: "إرسال خبر" };

export default async function SubmitNewsPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login?next=/news/submit");

  return (
    <div>
      <h1 style={{ marginBottom: "var(--space-4)" }}>إرسال خبر</h1>
      <SubmitNewsForm userId={user.id} />
    </div>
  );
}
