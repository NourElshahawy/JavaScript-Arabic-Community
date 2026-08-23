"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AcceptAnswerButton({ questionId, answerId, isAccepted }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("questions")
      .update({ accepted_answer_id: isAccepted ? null : answerId })
      .eq("id", questionId);

    if (!error) router.refresh();
    setPending(false);
  }

  return (
    <button
      type="button"
      className="action-btn"
      onClick={handleClick}
      disabled={pending}
      style={isAccepted ? { color: "var(--color-accept)" } : undefined}
    >
      <CheckCircle2 size={16} fill={isAccepted ? "currentColor" : "none"} />
      {isAccepted ? "الإجابة المقبولة" : "اقبل هذه الإجابة"}
    </button>
  );
}
