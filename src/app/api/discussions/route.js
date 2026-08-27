import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDiscussions } from "@/lib/data/discussions";

const PAGE_SIZE = 20;
const SORTS = new Set(["newest", "active", "votes"]);

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const offset = Number(params.get("offset") ?? 0) || 0;
  const sortParam = params.get("sort");
  const sort = SORTS.has(sortParam) ? sortParam : "newest";
  const tagSlug = params.get("tag") || undefined;

  const supabase = await createClient();
  const { discussions } = await getDiscussions(supabase, { offset, limit: PAGE_SIZE, sort, tagSlug });

  return NextResponse.json({ items: discussions, hasMore: discussions.length === PAGE_SIZE });
}
