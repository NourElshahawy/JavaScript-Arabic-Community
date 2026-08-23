"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function DiscussionFollowButton({ discussionId, initialFollowing, isAuthenticated }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);

  async function handleClick() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (following) {
      const { error } = await supabase.from("discussion_follows").delete().eq("discussion_id", discussionId).eq("user_id", user.id);
      if (!error) setFollowing(false);
    } else {
      const { error } = await supabase.from("discussion_follows").insert({ discussion_id: discussionId, user_id: user.id });
      if (!error) setFollowing(true);
    }
  }

  return (
    <button type="button" className="action-btn" data-active={following} onClick={handleClick}>
      {following ? <Bell size={16} fill="currentColor" /> : <BellOff size={16} />}
      {following ? "متابَع" : "تابع النقاش"}
    </button>
  );
}
