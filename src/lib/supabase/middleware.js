import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Refreshes the Supabase auth session on every request so Server Components
// always see a valid (or correctly expired) session. See middleware.js.
export async function updateSession(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email") || pathname.startsWith("/auth");
  const isProtectedRoute = pathname.startsWith("/admin") || pathname.startsWith("/settings") ||
    pathname.startsWith("/onboarding") || pathname.startsWith("/new") ||
    pathname.startsWith("/notifications") || pathname.startsWith("/bookmarks");

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute && !pathname.startsWith("/auth")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
