import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublishedInterviews } from "@/lib/data/interviews";

const PAGE_SIZE = 20;

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const offset = Number(params.get("offset") ?? 0) || 0;
  const difficulty = params.get("difficulty") || undefined;
  const level = params.get("level") || undefined;

  const supabase = await createClient();
  const { interviews } = await getPublishedInterviews(supabase, { offset, limit: PAGE_SIZE, difficulty, level });

  return NextResponse.json({ items: interviews, hasMore: interviews.length === PAGE_SIZE });
}
