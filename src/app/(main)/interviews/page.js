import Link from "next/link";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getPublishedInterviews } from "@/lib/data/interviews";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { LoadMoreList } from "@/components/ui/LoadMoreList";

export const metadata = { title: "تجارب الانترفيو" };

const PAGE_SIZE = 20;

const DIFFICULTY = [
  { key: "all", label: "كل المستويات" },
  { key: "easy", label: "سهل" },
  { key: "medium", label: "متوسط" },
  { key: "hard", label: "صعب" },
];
const LEVEL = [
  { key: "all", label: "كل الخبرات" },
  { key: "junior", label: "Junior" },
  { key: "mid", label: "Mid" },
  { key: "senior", label: "Senior" },
  { key: "lead", label: "Lead" },
];

function buildEndpoint(difficulty, level) {
  const params = new URLSearchParams();
  if (difficulty && difficulty !== "all") params.set("difficulty", difficulty);
  if (level && level !== "all") params.set("level", level);
  const qs = params.toString();
  return qs ? `/api/interviews?${qs}` : "/api/interviews";
}

export default async function InterviewsPage({ searchParams }) {
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const difficulty = DIFFICULTY.some((d) => d.key === searchParams?.difficulty) ? searchParams.difficulty : "all";
  const level = LEVEL.some((l) => l.key === searchParams?.level) ? searchParams.level : "all";

  const { interviews } = await getPublishedInterviews(supabase, {
    limit: PAGE_SIZE,
    difficulty: difficulty === "all" ? undefined : difficulty,
    level: level === "all" ? undefined : level,
  });

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

      <SectionTabs basePath="/interviews" param="difficulty" current={difficulty} tabs={DIFFICULTY} keep={{ level: level !== "all" ? level : "" }} label="مستوى الصعوبة" />
      <SectionTabs basePath="/interviews" param="level" current={level} tabs={LEVEL} keep={{ difficulty: difficulty !== "all" ? difficulty : "" }} label="مستوى الخبرة" />

      {interviews.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Briefcase}
            title={difficulty !== "all" || level !== "all" ? "لا توجد تجارب بهذه الفلترة" : "لا توجد تجارب منشورة بعد"}
            description={difficulty !== "all" || level !== "all" ? undefined : "شارك تجربتك في مقابلة عمل لتساعد مطورين آخرين."}
          />
        </div>
      ) : (
        <LoadMoreList
          key={`${difficulty}-${level}`}
          type="interview"
          endpoint={buildEndpoint(difficulty, level)}
          initialItems={interviews}
          initialHasMore={interviews.length === PAGE_SIZE}
        />
      )}
    </div>
  );
}
