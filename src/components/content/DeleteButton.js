"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/errors";

// Deletes one row by id. RLS already restricts this to the author (or a
// moderator) for posts/comments/questions/discussions/answers, so this is a
// thin wrapper: confirm → delete → toast → redirect or hand back to caller.
export function DeleteButton({
  table,
  id,
  redirectTo,
  onDeleted,
  label = "حذف",
  confirmText = "متأكد إنك عايز تمسح ده؟ مش هينفع تتراجع.",
  variant = "menu",
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (busy || !window.confirm(confirmText)) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      setBusy(false);
      toast(errorMessage(error, "تعذّر الحذف، حاول مرة أخرى."), { type: "error" });
      return;
    }
    toast("تم الحذف.", { type: "success" });
    if (onDeleted) onDeleted();
    else if (redirectTo) router.push(redirectTo);
    else router.refresh();
  }

  if (variant === "menu") {
    return (
      <button type="button" className="menu__item menu__item--danger" onClick={handleDelete} disabled={busy}>
        <Trash2 size={16} /> {label}
      </button>
    );
  }

  return (
    <button type="button" className="btn btn--ghost btn--sm" onClick={handleDelete} disabled={busy} style={{ color: "var(--color-danger)" }}>
      <Trash2 size={14} /> {label}
    </button>
  );
}
