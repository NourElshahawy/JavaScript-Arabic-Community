"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/errors";

export function BookmarkButton({ contentType = "post", contentId, initialBookmarked, isAuthenticated, iconOnly = false }) {
  const router = useRouter();
  const toast = useToast();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  async function handleClick() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const nextBookmarked = !bookmarked;
    setBookmarked(nextBookmarked);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (nextBookmarked) {
      const { error } = await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, content_type: contentType, content_id: contentId });
      if (error) {
        setBookmarked(false);
        toast(errorMessage(error, "تعذّر الحفظ."), { type: "error" });
      } else {
        toast("تم الحفظ في المحفوظات.", { type: "success" });
      }
    } else {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("content_type", contentType)
        .eq("content_id", contentId);
      if (error) {
        setBookmarked(true);
        toast(errorMessage(error, "تعذّر إلغاء الحفظ."), { type: "error" });
      }
    }
  }

  return (
    <button
      type="button"
      className={iconOnly ? "btn btn--icon btn--sm" : "action-btn"}
      data-active={bookmarked}
      onClick={handleClick}
      aria-pressed={bookmarked}
      aria-label="حفظ"
      style={bookmarked ? { color: "var(--color-brand)" } : undefined}
    >
      <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
      {iconOnly ? null : "حفظ"}
    </button>
  );
}
