import { createClient } from "@/lib/supabase/server";

async function countRows(supabase, table, filters = {}) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value);
  }
  const { count } = await query;
  return count ?? 0;
}

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalPosts,
    totalComments,
    pendingReports,
    totalTags,
  ] = await Promise.all([
    countRows(supabase, "profiles"),
    countRows(supabase, "profiles", { status: "active" }),
    countRows(supabase, "profiles", { status: "suspended" }),
    countRows(supabase, "posts", { status: "approved" }),
    countRows(supabase, "comments"),
    countRows(supabase, "reports", { status: "pending" }),
    countRows(supabase, "tags"),
  ]);

  const stats = [
    { label: "إجمالي المستخدمين", value: totalUsers },
    { label: "مستخدمون نشطون", value: activeUsers },
    { label: "مستخدمون موقوفون", value: suspendedUsers },
    { label: "إجمالي المنشورات", value: totalPosts },
    { label: "إجمالي التعليقات", value: totalComments },
    { label: "تقارير قيد الانتظار", value: pendingReports },
    { label: "الوسوم", value: totalTags },
  ];

  return (
    <div className="stat-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="card stat-card">
          <span className="stat-card__value">{stat.value}</span>
          <span className="stat-card__label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
