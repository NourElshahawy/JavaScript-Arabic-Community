"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/errors";

export function VoteButton({ contentType, contentId, initialVote, initialScore, isAuthenticated }) {
  const router = useRouter();
  const toast = useToast();
  const [vote, setVote] = useState(initialVote); // "up" | "down" | null
  const [score, setScore] = useState(initialScore);

  async function handleVote(direction) {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const previousVote = vote;
    const previousScore = score;

    if (previousVote === direction) {
      // Toggling the same direction off.
      setVote(null);
      setScore((s) => s + (direction === "up" ? -1 : 1));
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("user_id", user.id)
        .eq("content_type", contentType)
        .eq("content_id", contentId);
      if (error) {
        setVote(previousVote);
        setScore(previousScore);
        toast(errorMessage(error, "تعذّر التصويت، حاول مرة أخرى."), { type: "error" });
      }
      return;
    }

    const scoreDelta = (direction === "up" ? 1 : -1) - (previousVote === "up" ? 1 : previousVote === "down" ? -1 : 0);
    setVote(direction);
    setScore((s) => s + scoreDelta);

    const { error } = await supabase
      .from("votes")
      .upsert(
        { user_id: user.id, content_type: contentType, content_id: contentId, value: direction },
        { onConflict: "user_id,content_type,content_id" }
      );

    if (error) {
      setVote(previousVote);
      setScore(previousScore);
      toast(errorMessage(error, "تعذّر التصويت، حاول مرة أخرى."), { type: "error" });
    } else {
      router.refresh();
    }
  }

  return (
    <div className="vote">
      <button
        type="button"
        className="vote__btn"
        data-active={vote === "up"}
        data-direction="up"
        aria-label="تصويت إيجابي"
        onClick={() => handleVote("up")}
      >
        <ChevronUp size={18} />
      </button>
      <span className="vote__count">{score}</span>
      <button
        type="button"
        className="vote__btn"
        data-active={vote === "down"}
        data-direction="down"
        aria-label="تصويت سلبي"
        onClick={() => handleVote("down")}
      >
        <ChevronDown size={18} />
      </button>
    </div>
  );
}
