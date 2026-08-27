import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublishedNews } from "@/lib/data/news";

const PAGE_SIZE = 20;

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const offset = Number(params.get("offset") ?? 0) || 0;
  const tagSlug = params.get("tag") || undefined;

  const supabase = await createClient();
  const { news } = await getPublishedNews(supabase, { offset, limit: PAGE_SIZE, tagSlug });

  return NextResponse.json({ items: news, hasMore: news.length === PAGE_SIZE });
}
