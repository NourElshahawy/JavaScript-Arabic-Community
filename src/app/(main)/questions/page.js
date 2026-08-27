import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getQuestions } from "@/lib/data/questions";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { TagFilterBar } from "@/components/ui/TagFilterBar";
import { LoadMoreList } from "@/components/ui/LoadMoreList";

export const metadata = { title: "الأسئلة" };

const PAGE_SIZE = 20;
const SORTS = [
  { key: "newest", label: "الأحدث" },
  { key: "votes", label: "الأكثر تصويتًا" },
  { key: "unanswered", label: "بدون إجابة" },
];

function buildEndpoint(sort, tag) {
  const params = new URLSearchParams();
  if (sort && sort !== "newest") params.set("sort", sort);
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return qs ? `/api/questions?${qs}` : "/api/questions";
}

export default async function QuestionsPage({ searchParams }) {
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const sort = SORTS.some((s) => s.key === searchParams?.sort) ? searchParams.sort : "newest";
  const tag = searchParams?.tag || null;

  const [{ questions }, { data: topTags }] = await Promise.all([
    getQuestions(supabase, { limit: PAGE_SIZE, sort, tagSlug: tag || undefined }),
    supabase.from("tags").select("id, name, slug").order("usage_count", { ascending: false }).limit(10),
  ]);

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

      <SectionTabs basePath="/questions" param="sort" current={sort} tabs={SORTS} keep={{ tag }} label="ترتيب الأسئلة" />
      <TagFilterBar basePath="/questions" tags={topTags ?? []} active={tag} keep={{ sort: sort !== "newest" ? sort : "" }} />

      {questions.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={HelpCircle}
            title={tag ? `لا توجد أسئلة بوسم #${tag}` : sort === "unanswered" ? "كل الأسئلة عليها إجابات" : "لا توجد أسئلة بعد"}
            description={tag || sort === "unanswered" ? undefined : "كن أول من يطرح سؤالاً تقنيًا على المجتمع."}
          />
        </div>
      ) : (
        <LoadMoreList
          key={`${sort}-${tag || "all"}`}
          type="question"
          endpoint={buildEndpoint(sort, tag)}
          initialItems={questions}
          initialHasMore={questions.length === PAGE_SIZE}
        />
      )}
    </div>
  );
}
