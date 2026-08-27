import { MessageSquareText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getFeedPosts } from "@/lib/data/posts";
import { PostComposer } from "@/components/post/PostComposer";
import { EmptyState } from "@/components/ui/States";
import { LoadMoreList } from "@/components/ui/LoadMoreList";

const PAGE_SIZE = 20;

export default async function HomePage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentUser();
  const { posts } = await getFeedPosts(supabase, { userId: user?.id, limit: PAGE_SIZE });

  return (
    <div>
      {profile ? <PostComposer profile={profile} /> : null}

      {posts.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="لا يوجد محتوى بعد"
          description="كن أول مطور ينشر في المجتمع."
        />
      ) : (
        <LoadMoreList
          type="post"
          endpoint="/api/feed"
          initialItems={posts}
          initialHasMore={posts.length === PAGE_SIZE}
          isAuthenticated={!!user}
        />
      )}
    </div>
  );
}
