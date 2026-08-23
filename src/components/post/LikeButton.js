"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LikeButton({ postId, initialLiked, initialCount, isAuthenticated }) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [, startTransition] = useTransition();

  async function handleClick() {
    if (!isAuthenticated) {
      router.push(`/login?next=/`);
      return;
    }

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    const supabase = createClient();
    if (nextLiked) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("votes").insert({
        user_id: user.id,
        content_type: "post",
        content_id: postId,
        value: "up",
      });
      if (error) {
        setLiked(false);
        setCount((c) => c - 1);
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("user_id", user.id)
        .eq("content_type", "post")
        .eq("content_id", postId);
      if (error) {
        setLiked(true);
        setCount((c) => c + 1);
      }
    }

    startTransition(() => router.refresh());
  }

  return (
    <button type="button" className="action-btn" data-active={liked} onClick={handleClick} aria-pressed={liked}>
      <Heart size={16} className="action-btn__icon" />
      {count > 0 ? count : "إعجاب"}
    </button>
  );
}
