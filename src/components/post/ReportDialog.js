"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const REASONS = [
  { value: "spam", label: "سبام" },
  { value: "harassment", label: "مضايقة" },
  { value: "offensive", label: "محتوى مسيء" },
  { value: "fake_information", label: "معلومات مغلوطة" },
  { value: "copyright", label: "حقوق ملكية" },
  { value: "other", label: "أخرى" },
];

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function ReportDialog({ contentType, contentId, isAuthenticated, trigger }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    panel?.querySelector(FOCUSABLE_SELECTOR)?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleOpen() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setOpen(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      content_type: contentType,
      content_id: contentId,
      reason,
      description: description.trim() || null,
    });

    setSubmitting(false);
    if (!error) setDone(true);
  }

  function handleClose() {
    setOpen(false);
    setDone(false);
    setDescription("");
    setReason("spam");
    triggerRef.current?.focus();
  }

  return (
    <>
      {trigger ? (
        <span ref={triggerRef} tabIndex={-1} onClick={handleOpen}>
          {trigger}
        </span>
      ) : (
        <button ref={triggerRef} type="button" className="action-btn" onClick={handleOpen}>
          <Flag size={16} /> إبلاغ
        </button>
      )}

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-dialog-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "var(--z-modal)",
            padding: "var(--space-4)",
          }}
          onClick={handleClose}
        >
          <div ref={panelRef} className="card" style={{ maxWidth: 400, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            {done ? (
              <div className="state-block" style={{ padding: "var(--space-4)" }}>
                <div className="state-block__title" id="report-dialog-title">
                  تم إرسال البلاغ
                </div>
                <p className="state-block__description">شكرًا لمساعدتك في الحفاظ على المجتمع. سيراجعه فريق الإشراف.</p>
                <Button variant="outline" size="sm" onClick={handleClose}>
                  إغلاق
                </Button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <h3 id="report-dialog-title">الإبلاغ عن هذا المحتوى</h3>
                <div className="field">
                  <label className="field__label" htmlFor="report-reason">
                    السبب
                  </label>
                  <select id="report-reason" className="select" value={reason} onChange={(e) => setReason(e.target.value)}>
                    {REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="report-description">
                    تفاصيل إضافية (اختياري)
                  </label>
                  <textarea
                    id="report-description"
                    className="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <Button variant="ghost" onClick={handleClose}>
                    إلغاء
                  </Button>
                  <Button variant="danger" full disabled={submitting} onClick={handleSubmit}>
                    {submitting ? "جاري الإرسال..." : "إرسال البلاغ"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
