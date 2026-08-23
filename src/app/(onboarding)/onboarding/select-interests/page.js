import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { SelectInterestsForm } from "./SelectInterestsForm";

export const metadata = { title: "اختر اهتماماتك" };

export default async function SelectInterestsPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: tags } = await supabase.from("tags").select("id, name, slug").order("usage_count", { ascending: false });

  return <SelectInterestsForm tags={tags ?? []} userId={user.id} />;
}
