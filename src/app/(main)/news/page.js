import Link from "next/link";
import { Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getPublishedNews } from "@/lib/data/news";
import { NewsCard } from "@/components/post/NewsCard";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "الأخبار" };

export default async function NewsPage() {
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const { news } = await getPublishedNews(supabase);

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
        news.map((item) => <NewsCard key={item.id} item={item} />)
      )}
    </div>
  );
}
