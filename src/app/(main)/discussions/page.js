import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getDiscussions } from "@/lib/data/discussions";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { LoadMoreList } from "@/components/ui/LoadMoreList";

export const metadata = { title: "النقاشات" };

const PAGE_SIZE = 20;

export default async function DiscussionsPage() {
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const { discussions } = await getDiscussions(supabase, { limit: PAGE_SIZE });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <h1>النقاشات</h1>
        <span style={{ marginInlineStart: "auto" }}>
          <Link href={user ? "/discussions/new" : "/login?next=/discussions/new"}>
            <Button size="sm">ابدأ نقاشًا</Button>
          </Link>
        </span>
      </div>

      {discussions.length === 0 ? (
        <div className="card">
          <EmptyState icon={MessagesSquare} title="لا توجد نقاشات بعد" description="ابدأ نقاشًا مفتوحًا حول تقنية أو قرار هندسي." />
        </div>
      ) : (
        <LoadMoreList type="discussion" endpoint="/api/discussions" initialItems={discussions} initialHasMore={discussions.length === PAGE_SIZE} />
      )}
    </div>
  );
}
