"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/Button";

export function FollowButton({ targetUserId, initialFollowing, isAuthenticated }) {
  const router = useRouter();
  const toast = useToast();
  const [following, setFollowing] = useState(initialFollowing);
  const [hovering, setHovering] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (following) {
      const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
      if (error) toast(errorMessage(error, "تعذّر إلغاء المتابعة."), { type: "error" });
      else setFollowing(false);
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
      if (error) toast(errorMessage(error, "تعذّر المتابعة."), { type: "error" });
      else setFollowing(true);
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant={following ? "outline" : "primary"}
      size="sm"
      onClick={handleClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      disabled={loading}
    >
      {following ? (hovering ? "إلغاء المتابعة" : "متابَع") : "متابعة"}
    </Button>
  );
}
