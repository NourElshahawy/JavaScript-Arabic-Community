import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getFeedPosts } from "@/lib/data/posts";

const PAGE_SIZE = 20;

export async function GET(request) {
  const offset = Number(new URL(request.url).searchParams.get("offset") ?? 0) || 0;
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const { posts } = await getFeedPosts(supabase, { userId: user?.id, offset, limit: PAGE_SIZE });

  return NextResponse.json({ items: posts, hasMore: posts.length === PAGE_SIZE });
}
