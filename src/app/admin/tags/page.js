import { createClient } from "@/lib/supabase/server";
import { TagsManager } from "@/components/admin/TagsManager";

export const metadata = { title: "الوسوم · لوحة التحكم" };

export default async function AdminTagsPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase.from("tags").select("id, name, slug, usage_count").order("usage_count", { ascending: false });

  return <TagsManager initialTags={tags ?? []} />;
}
