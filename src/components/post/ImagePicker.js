"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

const MAX_IMAGES = 4;
const MAX_SIZE = 5 * 1024 * 1024;

export function ImagePicker({ images, onChange, disabled }) {
  const inputRef = useRef(null);

  function handleSelect(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const accepted = [];
    for (const file of files) {
      if (images.length + accepted.length >= MAX_IMAGES) break;
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_SIZE) continue;
      accepted.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    if (accepted.length) onChange([...images, ...accepted]);
  }

  function removeAt(index) {
    const removed = images[index];
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      {images.length > 0 ? (
        <div className="composer__image-grid">
          {images.map((img, i) => (
            <div key={img.previewUrl} className="composer__image-thumb">
              {/* Local blob preview only — not the final uploaded asset — a
                  plain <img> is correct here, not next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.previewUrl} alt="" />
              <button type="button" onClick={() => removeAt(i)} aria-label="إزالة الصورة" disabled={disabled}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {images.length < MAX_IMAGES ? (
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <ImagePlus size={16} /> إضافة صور
        </button>
      ) : null}

      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handleSelect} />
    </div>
  );
}
