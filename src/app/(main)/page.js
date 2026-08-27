import Link from "next/link";
import { MessageSquareText, HelpCircle, Newspaper, Briefcase, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getFeedPosts } from "@/lib/data/posts";
import { PostComposer } from "@/components/post/PostComposer";
import { EmptyState } from "@/components/ui/States";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { TagFilterBar } from "@/components/ui/TagFilterBar";
import { LoadMoreList } from "@/components/ui/LoadMoreList";

const PAGE_SIZE = 20;

const TABS = [
  { key: "foryou", label: "لك" },
  { key: "following", label: "المتابَعون" },
  { key: "latest", label: "الأحدث" },
];

function buildEndpoint(tab, tag) {
  const params = new URLSearchParams({ feed: tab });
  if (tag) params.set("tag", tag);
  return `/api/feed?${params.toString()}`;
}

export default async function HomePage({ searchParams }) {
  const supabase = await createClient();
  const { user, profile } = await getCurrentUser();

  const requestedTab = searchParams?.tab;
  const tab = user ? (TABS.some((t) => t.key === requestedTab) ? requestedTab : "foryou") : "latest";
  const tag = searchParams?.tag || null;

  const [{ posts, empty }, { data: topTags }] = await Promise.all([
    getFeedPosts(supabase, { userId: user?.id, feed: tab, tagSlug: tag || undefined, limit: PAGE_SIZE }),
    supabase.from("tags").select("id, name, slug").order("usage_count", { ascending: false }).limit(10),
  ]);

  return (
    <div>
      {!user ? <LandingHero /> : null}

      {profile ? <PostComposer profile={profile} /> : null}

      {user ? (
        <SectionTabs basePath="/" param="tab" current={tab} tabs={TABS} keep={{ tag }} label="نوع الفيد" />
      ) : null}

      <TagFilterBar basePath="/" tags={topTags ?? []} active={tag} keep={{ tab: user && tab !== "foryou" ? tab : "" }} />

      {posts.length === 0 ? (
        empty === "following" ? (
          <EmptyState
            icon={Users}
            title="مش بتتابع حد لسه"
            description="تابع مطورين من صفحة المطورين وهيظهر محتواهم هنا."
            action={
              <Link href="/users" className="btn btn--outline btn--sm">
                تصفّح المطورين
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={MessageSquareText}
            title={tag ? `لا توجد منشورات بوسم #${tag}` : "لا يوجد محتوى بعد"}
            description={tag ? undefined : "كن أول مطور ينشر في المجتمع."}
          />
        )
      ) : (
        <LoadMoreList
          key={`${tab}-${tag || "all"}`}
          type="post"
          endpoint={buildEndpoint(tab, tag)}
          initialItems={posts}
          initialHasMore={posts.length === PAGE_SIZE}
          isAuthenticated={!!user}
          liveUpdates={tab === "latest" && !tag}
        />
      )}
    </div>
  );
}

function LandingHero() {
  return (
    <section className="landing-hero card">
      <h1>مجتمع مطوّري JavaScript العربي</h1>
      <p className="landing-hero__lead">
        اسأل الأسئلة التقنية بالعربي، شارك خبرتك، تابع أخبار الـ ecosystem، واقرأ تجارب انترفيو حقيقية من مطورين زيك.
      </p>
      <div className="landing-hero__cta">
        <Link href="/register" className="btn btn--primary btn--lg">
          إنشاء حساب
        </Link>
        <Link href="/questions" className="btn btn--outline btn--lg">
          تصفّح الأسئلة
        </Link>
      </div>
      <div className="landing-hero__features">
        <div className="landing-hero__feature">
          <HelpCircle size={18} />
          <span>أسئلة وإجابات مع تصويت وإجابة مقبولة</span>
        </div>
        <div className="landing-hero__feature">
          <MessageSquareText size={18} />
          <span>نقاشات مفتوحة حول أدوات وممارسات</span>
        </div>
        <div className="landing-hero__feature">
          <Newspaper size={18} />
          <span>أخبار مختارة عن JavaScript وأدواته</span>
        </div>
        <div className="landing-hero__feature">
          <Briefcase size={18} />
          <span>تجارب انترفيو مفصّلة بالشركات والأسئلة</span>
        </div>
      </div>
    </section>
  );
}
