import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDiscussions } from "@/lib/data/discussions";

const PAGE_SIZE = 20;

export async function GET(request) {
  const offset = Number(new URL(request.url).searchParams.get("offset") ?? 0) || 0;
  const supabase = await createClient();
  const { discussions } = await getDiscussions(supabase, { offset, limit: PAGE_SIZE });

  return NextResponse.json({ items: discussions, hasMore: discussions.length === PAGE_SIZE });
}
