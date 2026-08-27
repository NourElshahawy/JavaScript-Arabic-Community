import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getDiscussions } from "@/lib/data/discussions";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { TagFilterBar } from "@/components/ui/TagFilterBar";
import { LoadMoreList } from "@/components/ui/LoadMoreList";

export const metadata = { title: "النقاشات" };

const PAGE_SIZE = 20;
const SORTS = [
  { key: "newest", label: "الأحدث" },
  { key: "active", label: "الأكثر تفاعلًا" },
  { key: "votes", label: "الأكثر تصويتًا" },
];

function buildEndpoint(sort, tag) {
  const params = new URLSearchParams();
  if (sort && sort !== "newest") params.set("sort", sort);
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return qs ? `/api/discussions?${qs}` : "/api/discussions";
}

export default async function DiscussionsPage({ searchParams }) {
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const sort = SORTS.some((s) => s.key === searchParams?.sort) ? searchParams.sort : "newest";
  const tag = searchParams?.tag || null;

  const [{ discussions }, { data: topTags }] = await Promise.all([
    getDiscussions(supabase, { limit: PAGE_SIZE, sort, tagSlug: tag || undefined }),
    supabase.from("tags").select("id, name, slug").order("usage_count", { ascending: false }).limit(10),
  ]);

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

      <SectionTabs basePath="/discussions" param="sort" current={sort} tabs={SORTS} keep={{ tag }} label="ترتيب النقاشات" />
      <TagFilterBar basePath="/discussions" tags={topTags ?? []} active={tag} keep={{ sort: sort !== "newest" ? sort : "" }} />

      {discussions.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={MessagesSquare}
            title={tag ? `لا توجد نقاشات بوسم #${tag}` : "لا توجد نقاشات بعد"}
            description={tag ? undefined : "ابدأ نقاشًا مفتوحًا حول تقنية أو قرار هندسي."}
          />
        </div>
      ) : (
        <LoadMoreList
          key={`${sort}-${tag || "all"}`}
          type="discussion"
          endpoint={buildEndpoint(sort, tag)}
          initialItems={discussions}
          initialHasMore={discussions.length === PAGE_SIZE}
        />
      )}
    </div>
  );
}
