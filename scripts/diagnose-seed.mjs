// Pinpoints why the demo seed isn't inserting content. Read-only except
// for one throwaway news row it inserts then immediately deletes.
//
//   $env:NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="<service_role secret>"
//   node scripts/diagnose-seed.mjs

import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// A service_role JWT has "role":"service_role" in its payload.
try {
  const payload = JSON.parse(Buffer.from(KEY.split(".")[1], "base64").toString());
  console.log(`key role = ${payload.role}  ${payload.role === "service_role" ? "✓" : "✗ (needs service_role!)"}`);
} catch {
  console.log("could not decode the key as a JWT");
}

const supabase = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

console.log("\n1) auth users:");
const { data: users, error: usersErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
if (usersErr) console.log("   listUsers error:", usersErr.message);
else console.log("   " + users.users.length + " users:", users.users.map((u) => u.email).join(", "));

console.log("\n2) demo profiles:");
const { data: profiles, error: profErr } = await supabase
  .from("profiles")
  .select("id, username, status, onboarding_completed")
  .in("username", ["ahmed_nasser", "sara_abdallah", "m_sherif", "mennah_h", "youssef_kamal", "layla_mansour", "khaled_omar", "nour_adel"]);
if (profErr) console.log("   error:", profErr.message);
else console.table(profiles);

console.log("\n3) news rows currently in the table:");
const { data: news, error: newsErr } = await supabase.from("news").select("id, title, status, published_at").order("published_at", { ascending: false });
if (newsErr) console.log("   error:", newsErr.message);
else console.table((news ?? []).map((n) => ({ ...n, title: n.title.slice(0, 45) })));

console.log("\n4) test insert of one news row (will be deleted):");
const submitter = profiles?.[0]?.id;
if (!submitter) {
  console.log("   no demo profile to attribute it to — that's the problem: users didn't seed.");
} else {
  const { data: inserted, error: insErr } = await supabase
    .from("news")
    .insert({
      submitted_by: submitter,
      title: "__diagnostic__ " + Date.now(),
      summary: "throwaway",
      source_url: "https://example.com",
      source_name: "diag",
      status: "approved",
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insErr) {
    console.log("   INSERT FAILED:");
    console.log("     message:", insErr.message);
    console.log("     code   :", insErr.code);
    console.log("     details:", insErr.details);
    console.log("     hint   :", insErr.hint);
  } else {
    console.log("   INSERT OK — id", inserted.id, "(so the seed's news calls should work; the seed is aborting earlier)");
    await supabase.from("news").delete().eq("id", inserted.id);
    console.log("   cleaned up.");
  }
}

console.log("\nDone.");
