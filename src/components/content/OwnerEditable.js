"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/content/DeleteButton";

// Wraps read-only content (`view`) and, for its owner, adds an inline
// "تعديل" / "حذف" row. Editing swaps `view` for textareas/inputs over the
// given `fields` and saves with a single UPDATE. `view` is passed as a
// prop so the server can render the rich version.
export function OwnerEditable({ isOwner, table, id, fields, view, redirectTo, editedAt }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.name, f.value ?? ""])));
  const [busy, setBusy] = useState(false);

  async function save(event) {
    event.preventDefault();
    for (const field of fields) {
      if (!String(values[field.name] ?? "").trim()) {
        toast(`${field.label} مطلوب.`, { type: "error" });
        return;
      }
    }
    setBusy(true);
    const supabase = createClient();
    const patch = Object.fromEntries(fields.map((f) => [f.name, String(values[f.name]).trim()]));
    if (editedAt) patch.updated_at = new Date().toISOString();
    const { error } = await supabase.from(table).update(patch).eq("id", id);
    setBusy(false);
    if (error) {
      toast(errorMessage(error, "تعذّر حفظ التعديل."), { type: "error" });
      return;
    }
    toast("تم الحفظ.", { type: "success" });
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {fields.map((field) =>
          field.textarea ? (
            <textarea
              key={field.name}
              className="textarea"
              rows={field.rows ?? 5}
              value={values[field.name]}
              onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              aria-label={field.label}
            />
          ) : (
            <input
              key={field.name}
              className="input"
              value={values[field.name]}
              onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              aria-label={field.label}
            />
          )
        )}
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? "جاري الحفظ..." : "حفظ"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={busy}>
            إلغاء
          </Button>
        </div>
      </form>
    );
  }

  return (
    <>
      {view}
      {isOwner ? (
        <div style={{ display: "flex", gap: "var(--space-1)", marginTop: "var(--space-2)" }}>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}>
            <Pencil size={14} /> تعديل
          </button>
          <DeleteButton table={table} id={id} redirectTo={redirectTo} variant="inline" />
        </div>
      ) : null}
    </>
  );
}
