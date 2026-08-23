import { createClient } from "@/lib/supabase/server";

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = await createClient();

  const [{ data: posts }, { data: questions }, { data: discussions }, { data: news }, { data: interviews }, { data: profiles }, { data: tags }] =
    await Promise.all([
      supabase.from("posts").select("id, updated_at").eq("status", "approved").limit(1000),
      supabase.from("questions").select("id, updated_at").eq("status", "approved").limit(1000),
      supabase.from("discussions").select("id, updated_at").eq("status", "approved").limit(1000),
      supabase.from("news").select("id, updated_at").eq("status", "approved").limit(1000),
      supabase.from("interview_experiences").select("id, updated_at").eq("status", "approved").limit(1000),
      supabase.from("profiles").select("username, updated_at").limit(1000),
      supabase.from("tags").select("slug").limit(1000),
    ]);

  const staticRoutes = ["", "/news", "/questions", "/discussions", "/interviews", "/tags", "/users", "/leaderboard"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const postRoutes = (posts ?? []).map((p) => ({ url: `${siteUrl}/posts/${p.id}`, lastModified: p.updated_at }));
  const questionRoutes = (questions ?? []).map((q) => ({ url: `${siteUrl}/questions/${q.id}`, lastModified: q.updated_at }));
  const discussionRoutes = (discussions ?? []).map((d) => ({ url: `${siteUrl}/discussions/${d.id}`, lastModified: d.updated_at }));
  const newsRoutes = (news ?? []).map((n) => ({ url: `${siteUrl}/news/${n.id}`, lastModified: n.updated_at }));
  const interviewRoutes = (interviews ?? []).map((i) => ({ url: `${siteUrl}/interviews/${i.id}`, lastModified: i.updated_at }));
  const profileRoutes = (profiles ?? []).map((p) => ({ url: `${siteUrl}/u/${p.username}`, lastModified: p.updated_at }));
  const tagRoutes = (tags ?? []).map((t) => ({ url: `${siteUrl}/tags/${t.slug}` }));

  return [
    ...staticRoutes,
    ...postRoutes,
    ...questionRoutes,
    ...discussionRoutes,
    ...newsRoutes,
    ...interviewRoutes,
    ...profileRoutes,
    ...tagRoutes,
  ];
}
