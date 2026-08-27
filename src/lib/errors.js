// Turns a Supabase / PostgREST error into a short Arabic message the user
// can act on. The database enforces rate limits (errcode 42901, migration
// 0018) and account-status bans (errcode 42501 with an "Account is …"
// message, migration 0013/0016); without this mapping every failure reads
// as the same generic "try again", which is misleading for both cases.

const GENERIC = "حصل خطأ غير متوقع، حاول مرة أخرى.";

export function errorMessage(error, fallback = GENERIC) {
  if (!error) return fallback;

  const code = error.code || "";
  const text = `${error.message || ""} ${error.details || ""} ${error.hint || ""}`.toLowerCase();

  if (code === "42901" || text.includes("rate limit")) {
    return "بترسل بسرعة شوية. استنى دقيقة كده وحاول تاني.";
  }

  if (text.includes("account is") || text.includes("cannot perform this action")) {
    return "حسابك موقوف حاليًا، فمش هتقدر تنشر أو تعلّق أو تصوّت. لو تفتكر ده غلط، تواصل مع فريق الإشراف.";
  }

  if (code === "42501" || text.includes("row-level security") || text.includes("permission denied")) {
    return "مش مسموح لك بالإجراء ده.";
  }

  if (code === "23505") {
    return "الحاجة دي موجودة بالفعل.";
  }

  if (code === "23514" || code === "23502") {
    return "في بيانات ناقصة أو مش صحيحة في النموذج.";
  }

  return fallback;
}
