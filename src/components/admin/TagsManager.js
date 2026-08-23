"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Trash2 } from "lucide-react";

function slugify(name) {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export function TagsManager({ initialTags }) {
  const [tags, setTags] = useState(initialTags);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(event) {
    event.preventDefault();
    const trimmed = name.trim();
    const slug = slugify(trimmed);
    if (!trimmed || !slug) return;

    setSubmitting(true);
    setError("");
    const supabase = createClient();
    const { data, error: insertError } = await supabase.from("tags").insert({ slug, name: trimmed }).select("id, name, slug, usage_count").single();

    if (insertError) {
      setError(insertError.message.includes("duplicate") ? "هذا الوسم موجود بالفعل." : "تعذّر إنشاء الوسم.");
      setSubmitting(false);
      return;
    }

    setTags((prev) => [data, ...prev]);
    setName("");
    setSubmitting(false);
  }

  async function handleDelete(tagId) {
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("tags").delete().eq("id", tagId);
    if (!deleteError) {
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <form onSubmit={handleCreate} className="card" style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Input placeholder="اسم الوسم، مثل: WebAssembly" value={name} onChange={(e) => setName(e.target.value)} />
          {error ? <span className="field__error">{error}</span> : null}
        </div>
        <Button type="submit" disabled={submitting || !name.trim()}>
          إضافة وسم
        </Button>
      </form>

      <div className="card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الوسم</th>
              <th>الاستخدام</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id}>
                <td>
                  {tag.name} <span className="post__author-username ltr">#{tag.slug}</span>
                </td>
                <td>{tag.usage_count}</td>
                <td>
                  <button className="btn btn--icon btn--sm" aria-label="حذف الوسم" onClick={() => handleDelete(tag.id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
