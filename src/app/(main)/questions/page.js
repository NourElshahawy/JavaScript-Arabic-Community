import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getQuestions } from "@/lib/data/questions";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { LoadMoreList } from "@/components/ui/LoadMoreList";

export const metadata = { title: "الأسئلة" };

const PAGE_SIZE = 20;

export default async function QuestionsPage() {
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const { questions } = await getQuestions(supabase, { limit: PAGE_SIZE });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <h1>الأسئلة</h1>
        <span style={{ marginInlineStart: "auto" }}>
          <Link href={user ? "/questions/new" : "/login?next=/questions/new"}>
            <Button size="sm">اطرح سؤالاً</Button>
          </Link>
        </span>
      </div>

      {questions.length === 0 ? (
        <div className="card">
          <EmptyState icon={HelpCircle} title="لا توجد أسئلة بعد" description="كن أول من يطرح سؤالاً تقنيًا على المجتمع." />
        </div>
      ) : (
        <LoadMoreList type="question" endpoint="/api/questions" initialItems={questions} initialHasMore={questions.length === PAGE_SIZE} />
      )}
    </div>
  );
}
