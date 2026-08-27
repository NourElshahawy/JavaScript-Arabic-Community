// Resolves a tag slug to the set of content ids of a given type that carry
// it, via the polymorphic content_tags table. Returns:
//   null  -> no slug given, caller should not filter
//   []    -> slug is unknown or matches nothing, caller should show empty
//   [ids] -> filter the list to these ids
export async function contentIdsForTag(supabase, contentType, tagSlug) {
  if (!tagSlug) return null;

  const { data: tag } = await supabase.from("tags").select("id").eq("slug", tagSlug).maybeSingle();
  if (!tag) return [];

  const { data } = await supabase
    .from("content_tags")
    .select("content_id")
    .eq("content_type", contentType)
    .eq("tag_id", tag.id)
    .limit(1000);

  return [...new Set((data ?? []).map((r) => r.content_id))];
}
