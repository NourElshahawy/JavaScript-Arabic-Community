import { createClient } from "@/lib/supabase/server";
import { InterviewsQueue } from "@/components/admin/InterviewsQueue";

export const metadata = { title: "تجارب الانترفيو · لوحة التحكم" };

export default async function AdminInterviewsPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("interview_experiences")
    .select("id, company, position, personal_experience, created_at, author:profiles!interview_experiences_author_id_fkey(username)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return <InterviewsQueue initialItems={items ?? []} />;
}
