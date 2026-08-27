import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getQuestions } from "@/lib/data/questions";

const PAGE_SIZE = 20;

export async function GET(request) {
  const offset = Number(new URL(request.url).searchParams.get("offset") ?? 0) || 0;
  const supabase = await createClient();
  const { questions } = await getQuestions(supabase, { offset, limit: PAGE_SIZE });

  return NextResponse.json({ items: questions, hasMore: questions.length === PAGE_SIZE });
}
