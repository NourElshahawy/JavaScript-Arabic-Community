"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function ShareButton({ path }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("تم نسخ الرابط.", { type: "success" });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast("متصفحك مش سامح بالنسخ. انسخ الرابط من شريط العنوان.", { type: "error" });
    }
  }

  return (
    <button type="button" className="action-btn" onClick={handleClick}>
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? "تم النسخ" : "مشاركة"}
    </button>
  );
}
