import { createClient } from "@/lib/supabase/server";
import { PostsModerationTable } from "@/components/admin/PostsModerationTable";

export const metadata = { title: "المنشورات · لوحة التحكم" };

export default async function AdminPostsPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, body, likes_count, comments_count, created_at, author:profiles!posts_author_id_fkey(username)")
    .order("created_at", { ascending: false })
    .limit(200);

  return <PostsModerationTable initialPosts={posts ?? []} />;
}
