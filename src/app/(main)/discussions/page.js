import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getDiscussions } from "@/lib/data/discussions";
import { DiscussionCard } from "@/components/post/DiscussionCard";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "النقاشات" };

export default async function DiscussionsPage() {
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const { discussions } = await getDiscussions(supabase);

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
        discussions.map((d) => <DiscussionCard key={d.id} discussion={d} />)
      )}
    </div>
  );
}
