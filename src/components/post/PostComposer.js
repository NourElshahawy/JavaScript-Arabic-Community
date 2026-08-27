"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { attachTags } from "@/lib/tags";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ImagePicker } from "@/components/post/ImagePicker";

export function PostComposer({ profile }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError("");
    const supabase = createClient();

    let imageUrls = [];
    if (images.length) {
      const uploads = await Promise.all(
        images.map(async ({ file }, index) => {
          const path = `${profile.id}/${Date.now()}-${index}-${file.name}`;
          const { error: uploadError } = await supabase.storage.from("post-images").upload(path, file);
          if (uploadError) return null;
          return supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
        })
      );
      imageUrls = uploads.filter(Boolean);
      if (imageUrls.length !== images.length) {
        setError("تعذّر رفع بعض الصور، حاول مرة أخرى.");
        setSubmitting(false);
        return;
      }
    }

    const { data: post, error: insertError } = await supabase
      .from("posts")
      .insert({ author_id: profile.id, body: trimmed, images: imageUrls })
      .select("id")
      .single();

    if (insertError || !post) {
      setError("تعذّر نشر المنشور، حاول مرة أخرى.");
      setSubmitting(false);
      return;
    }

    if (tagsInput.trim()) {
      await attachTags(supabase, "post", post.id, tagsInput);
    }

    setBody("");
    setTagsInput("");
    setImages([]);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form className="composer card" onSubmit={handleSubmit}>
      <div className="composer__row">
        <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
        <textarea
          className="textarea"
          placeholder="شارك سؤالاً، فكرة، أو تجربة مع المجتمع..."
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      <ImagePicker images={images} onChange={setImages} disabled={submitting} />

      <input
        type="text"
        className="input ltr"
        placeholder="tags: react, nodejs"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
      />
      {error ? <span className="field__error">{error}</span> : null}
      <div className="composer__footer">
        <span className="composer__footer-spacer" />
        <Button type="submit" disabled={submitting || !body.trim()}>
          {submitting ? "جاري النشر..." : "نشر"}
        </Button>
      </div>
    </form>
  );
}
