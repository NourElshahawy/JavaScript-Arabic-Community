"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { ShieldCheck } from "lucide-react";
import { timeAgo } from "@/lib/format";

const REASON_LABEL = {
  spam: "سبام",
  harassment: "مضايقة",
  offensive: "محتوى مسيء",
  fake_information: "معلومات مغلوطة",
  copyright: "حقوق ملكية",
  other: "أخرى",
};

const STATUS_VARIANT = { pending: "warning", reviewed: "brand", actioned: "success", dismissed: "neutral" };
const STATUS_LABEL = { pending: "قيد الانتظار", reviewed: "تمت المراجعة", actioned: "تم اتخاذ إجراء", dismissed: "مرفوض" };

function contentHref(report) {
  if (report.content_type === "post") return `/posts/${report.content_id}`;
  return null;
}

export function ReportsList({ initialReports }) {
  const [reports, setReports] = useState(initialReports);
  const [pendingId, setPendingId] = useState(null);

  async function setStatus(reportId, status) {
    setPendingId(reportId);
    const supabase = createClient();
    const { error } = await supabase.from("reports").update({ status, reviewed_at: new Date().toISOString() }).eq("id", reportId);
    if (!error) {
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
    }
    setPendingId(null);
  }

  if (reports.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={ShieldCheck} title="لا توجد تقارير" description="ستظهر هنا البلاغات المقدَّمة من المستخدمين." />
      </div>
    );
  }

  return (
    <div className="card admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>النوع</th>
            <th>السبب</th>
            <th>مُقدَّم من</th>
            <th>الوقت</th>
            <th>الحالة</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const href = contentHref(r);
            return (
              <tr key={r.id}>
                <td>{href ? <Link href={href}>{r.content_type}</Link> : r.content_type}</td>
                <td>
                  {REASON_LABEL[r.reason]}
                  {r.description ? (
                    <span style={{ display: "block", color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>
                      {r.description}
                    </span>
                  ) : null}
                </td>
                <td>{r.reporter ? `@${r.reporter.username}` : "—"}</td>
                <td>{timeAgo(r.created_at)}</td>
                <td>
                  <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button className="btn btn--outline btn--sm" disabled={pendingId === r.id} onClick={() => setStatus(r.id, "actioned")}>
                      اتخاذ إجراء
                    </button>
                    <button className="btn btn--ghost btn--sm" disabled={pendingId === r.id} onClick={() => setStatus(r.id, "dismissed")}>
                      رفض
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
