import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { AskQuestionForm } from "./AskQuestionForm";

export const metadata = { title: "اطرح سؤالاً" };

export default async function NewQuestionPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login?next=/questions/new");

  return (
    <div>
      <h1 style={{ marginBottom: "var(--space-4)" }}>اطرح سؤالاً</h1>
      <AskQuestionForm userId={user.id} />
    </div>
  );
}
