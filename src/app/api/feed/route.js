import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getFeedPosts } from "@/lib/data/posts";

const PAGE_SIZE = 20;
const FEEDS = new Set(["latest", "following", "foryou"]);

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const offset = Number(params.get("offset") ?? 0) || 0;
  const feedParam = params.get("feed");
  const feed = FEEDS.has(feedParam) ? feedParam : "latest";
  const tagSlug = params.get("tag") || undefined;

  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const { posts } = await getFeedPosts(supabase, { userId: user?.id, feed, tagSlug, offset, limit: PAGE_SIZE });

  return NextResponse.json({ items: posts, hasMore: posts.length === PAGE_SIZE });
}
