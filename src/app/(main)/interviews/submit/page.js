import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { SubmitInterviewForm } from "./SubmitInterviewForm";

export const metadata = { title: "شارك تجربتك" };

export default async function SubmitInterviewPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login?next=/interviews/submit");

  return (
    <div>
      <h1 style={{ marginBottom: "var(--space-4)" }}>شارك تجربة انترفيو</h1>
      <SubmitInterviewForm userId={user.id} />
    </div>
  );
}
