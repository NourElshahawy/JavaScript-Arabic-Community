import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublishedInterviews } from "@/lib/data/interviews";

const PAGE_SIZE = 20;

export async function GET(request) {
  const offset = Number(new URL(request.url).searchParams.get("offset") ?? 0) || 0;
  const supabase = await createClient();
  const { interviews } = await getPublishedInterviews(supabase, { offset, limit: PAGE_SIZE });

  return NextResponse.json({ items: interviews, hasMore: interviews.length === PAGE_SIZE });
}
