import { createClient } from "@/lib/supabase/server";

// Returns { user, profile } for the currently authenticated request, or
// { user: null, profile: null } when signed out. Use in Server Components.
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(`getCurrentUser: failed to load profile for user ${user.id}:`, error);
  }

  return { user, profile: profile ?? null };
}
