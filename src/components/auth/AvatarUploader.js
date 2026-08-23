"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";

export function AvatarUploader({ userId, name, initialUrl, onUploaded }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("الرجاء اختيار ملف صورة.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("حجم الصورة يجب ألا يتجاوز 2 ميغابايت.");
      return;
    }

    setError("");
    setUploading(true);
    const supabase = createClient();
    const extension = file.name.split(".").pop();
    const path = `${userId}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      cacheControl: "3600",
    });

    if (uploadError) {
      setError("تعذّر رفع الصورة. حاول مرة أخرى.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
    setPreview(publicUrl);
    onUploaded?.(publicUrl);
    setUploading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{ position: "relative", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        aria-label="تغيير الصورة الشخصية"
      >
        <Avatar src={preview} name={name} size="xl" />
        <span
          style={{
            position: "absolute",
            insetInlineEnd: -2,
            bottom: -2,
            width: 28,
            height: 28,
            borderRadius: "999px",
            background: "var(--color-brand)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--color-bg)",
          }}
        >
          <Camera size={14} />
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleChange} />
      {uploading ? <span className="field__hint">جاري الرفع...</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </div>
  );
}
