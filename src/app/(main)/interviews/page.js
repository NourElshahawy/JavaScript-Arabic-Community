import Link from "next/link";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getPublishedInterviews } from "@/lib/data/interviews";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { LoadMoreList } from "@/components/ui/LoadMoreList";

export const metadata = { title: "تجارب الانترفيو" };

const PAGE_SIZE = 20;

export default async function InterviewsPage() {
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const { interviews } = await getPublishedInterviews(supabase, { limit: PAGE_SIZE });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <h1>تجارب الانترفيو</h1>
        <span style={{ marginInlineStart: "auto" }}>
          <Link href={user ? "/interviews/submit" : "/login?next=/interviews/submit"}>
            <Button size="sm">شارك تجربتك</Button>
          </Link>
        </span>
      </div>

      {interviews.length === 0 ? (
        <div className="card">
          <EmptyState icon={Briefcase} title="لا توجد تجارب منشورة بعد" description="شارك تجربتك في مقابلة عمل لتساعد مطورين آخرين." />
        </div>
      ) : (
        <LoadMoreList type="interview" endpoint="/api/interviews" initialItems={interviews} initialHasMore={interviews.length === PAGE_SIZE} />
      )}
    </div>
  );
}
