import Link from "next/link";
import { Hash } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/States";

export const metadata = { title: "الوسوم" };

export default async function TagsPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase.from("tags").select("id, name, slug, usage_count").order("usage_count", { ascending: false });

  return (
    <div>
      <h1 style={{ marginBottom: "var(--space-4)" }}>الوسوم</h1>
      {!tags?.length ? (
        <div className="card">
          <EmptyState icon={Hash} title="لا توجد وسوم بعد" />
        </div>
      ) : (
        <div className="tag-list" style={{ gap: "var(--space-2)" }}>
          {tags.map((tag) => (
            <Link key={tag.id} href={`/tags/${tag.slug}`} className="tag" style={{ height: 32, fontSize: "var(--text-sm)" }}>
              {tag.name}
              <span style={{ color: "var(--color-text-muted)", marginInlineStart: 6 }}>{tag.usage_count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
