"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ path }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable — silently ignore, nothing else to do here.
    }
  }

  return (
    <button type="button" className="action-btn" onClick={handleClick}>
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? "تم النسخ" : "مشاركة"}
    </button>
  );
}
