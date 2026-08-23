import { MessageSquareText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getFeedPosts } from "@/lib/data/posts";
import { PostCard } from "@/components/post/PostCard";
import { PostComposer } from "@/components/post/PostComposer";
import { EmptyState } from "@/components/ui/States";

export default async function HomePage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentUser();
  const { posts } = await getFeedPosts(supabase, { userId: user?.id });

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
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} isAuthenticated={!!user} />
          ))}
        </div>
      )}
    </div>
  );
}
