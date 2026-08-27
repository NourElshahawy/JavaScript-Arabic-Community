import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getQuestions } from "@/lib/data/questions";

const PAGE_SIZE = 20;
const SORTS = new Set(["newest", "votes", "unanswered"]);

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const offset = Number(params.get("offset") ?? 0) || 0;
  const sortParam = params.get("sort");
  const sort = SORTS.has(sortParam) ? sortParam : "newest";
  const tagSlug = params.get("tag") || undefined;

  const supabase = await createClient();
  const { questions } = await getQuestions(supabase, { offset, limit: PAGE_SIZE, sort, tagSlug });

  return NextResponse.json({ items: questions, hasMore: questions.length === PAGE_SIZE });
}
