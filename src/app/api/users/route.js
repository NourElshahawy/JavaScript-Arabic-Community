import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsers } from "@/lib/data/profiles";

const PAGE_SIZE = 20;

export async function GET(request) {
  const offset = Number(new URL(request.url).searchParams.get("offset") ?? 0) || 0;
  const supabase = await createClient();
  const { users } = await getUsers(supabase, { offset, limit: PAGE_SIZE });

  return NextResponse.json({ items: users, hasMore: users.length === PAGE_SIZE });
}
