import Link from "next/link";
import { Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getPublishedNews } from "@/lib/data/news";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { LoadMoreList } from "@/components/ui/LoadMoreList";

export const metadata = { title: "الأخبار" };

const PAGE_SIZE = 20;

export default async function NewsPage() {
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const { news } = await getPublishedNews(supabase, { limit: PAGE_SIZE });

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

      {news.length === 0 ? (
        <div className="card">
          <EmptyState icon={Newspaper} title="لا توجد أخبار منشورة بعد" description="أرسل خبرًا عن JavaScript ecosystem وسيظهر هنا بعد مراجعة فريق الإشراف." />
        </div>
      ) : (
        <LoadMoreList type="news" endpoint="/api/news" initialItems={news} initialHasMore={news.length === PAGE_SIZE} />
      )}
    </div>
  );
}
