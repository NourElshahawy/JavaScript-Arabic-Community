import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublishedNews } from "@/lib/data/news";

const PAGE_SIZE = 20;

export async function GET(request) {
  const offset = Number(new URL(request.url).searchParams.get("offset") ?? 0) || 0;
  const supabase = await createClient();
  const { news } = await getPublishedNews(supabase, { offset, limit: PAGE_SIZE });

  return NextResponse.json({ items: news, hasMore: news.length === PAGE_SIZE });
}
