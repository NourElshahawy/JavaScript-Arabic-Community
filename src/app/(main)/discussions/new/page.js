import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { NewDiscussionForm } from "./NewDiscussionForm";

export const metadata = { title: "ابدأ نقاشًا" };

export default async function NewDiscussionPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login?next=/discussions/new");

  return (
    <div>
      <h1 style={{ marginBottom: "var(--space-4)" }}>ابدأ نقاشًا</h1>
      <NewDiscussionForm userId={user.id} />
    </div>
  );
}
