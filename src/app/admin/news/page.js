import { createClient } from "@/lib/supabase/server";
import { NewsQueue } from "@/components/admin/NewsQueue";

export const metadata = { title: "الأخبار · لوحة التحكم" };

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("news")
    .select("id, title, summary, source_url, created_at, submitter:profiles!news_submitted_by_fkey(username)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return <NewsQueue initialItems={items ?? []} />;
}
