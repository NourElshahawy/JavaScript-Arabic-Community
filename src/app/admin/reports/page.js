import { createClient } from "@/lib/supabase/server";
import { ReportsList } from "@/components/admin/ReportsList";

export const metadata = { title: "التقارير · لوحة التحكم" };

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("id, content_type, content_id, reason, description, status, created_at, reporter:profiles!reports_reporter_id_fkey(username)")
    .order("created_at", { ascending: false })
    .limit(200);

  return <ReportsList initialReports={reports ?? []} />;
}
