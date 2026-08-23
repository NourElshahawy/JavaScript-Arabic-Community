import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles both email-confirmation links and the Google OAuth redirect.
// Supabase sends a PKCE `code` here; we exchange it for a session cookie
// then forward the user to wherever they were headed (`next`).
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
