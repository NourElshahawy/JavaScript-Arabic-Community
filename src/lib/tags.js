// Client-side helper: parses a comma-separated tags input, upserts each tag
// by slug, and links it to a content item via the polymorphic content_tags
// table. Shared by every composer (posts, questions, news, interviews).
export async function attachTags(supabase, contentType, contentId, tagsInput, { max = 5 } = {}) {
  const tagNames = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, max);

  await Promise.all(
    tagNames.map(async (name) => {
      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      if (!slug) return;
      await supabase.from("tags").upsert({ slug, name }, { onConflict: "slug", ignoreDuplicates: true });
      const { data: tag } = await supabase.from("tags").select("id").eq("slug", slug).single();
      if (tag) {
        await supabase.from("content_tags").insert({ tag_id: tag.id, content_type: contentType, content_id: contentId });
      }
    })
  );
}
