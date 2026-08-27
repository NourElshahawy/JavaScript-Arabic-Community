import Link from "next/link";
import { Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getPublishedNews } from "@/lib/data/news";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { TagFilterBar } from "@/components/ui/TagFilterBar";
import { LoadMoreList } from "@/components/ui/LoadMoreList";

export const metadata = { title: "الأخبار" };

const PAGE_SIZE = 20;

export default async function NewsPage({ searchParams }) {
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const tag = searchParams?.tag || null;

  const [{ news }, { data: topTags }] = await Promise.all([
    getPublishedNews(supabase, { limit: PAGE_SIZE, tagSlug: tag || undefined }),
    supabase.from("tags").select("id, name, slug").order("usage_count", { ascending: false }).limit(10),
  ]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <h1>الأخبار</h1>
        <span style={{ marginInlineStart: "auto" }}>
          <Link href={user ? "/news/submit" : "/login?next=/news/submit"}>
            <Button size="sm">إرسال خبر</Button>
          </Link>
        </span>
      </div>

      <TagFilterBar basePath="/news" tags={topTags ?? []} active={tag} />

      {news.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Newspaper}
            title={tag ? `لا توجد أخبار بوسم #${tag}` : "لا توجد أخبار منشورة بعد"}
            description={tag ? undefined : "أرسل خبرًا عن JavaScript ecosystem وسيظهر هنا بعد مراجعة فريق الإشراف."}
          />
        </div>
      ) : (
        <LoadMoreList
          key={tag || "all"}
          type="news"
          endpoint={tag ? `/api/news?tag=${tag}` : "/api/news"}
          initialItems={news}
          initialHasMore={news.length === PAGE_SIZE}
        />
      )}
    </div>
  );
}
