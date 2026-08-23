import { Suspense } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";

function VerifyEmailContent({ searchParams }) {
  const email = searchParams?.email;

  return (
    <div className="auth-card__header">
      <MailCheck size={32} strokeWidth={1.5} />
      <h1>تحقق من بريدك الإلكتروني</h1>
      <p>
        أرسلنا رابط تفعيل إلى {email ? <strong className="ltr">{email}</strong> : "بريدك الإلكتروني"}. افتح الرابط لتفعيل
        حسابك وإكمال إعداد ملفك الشخصي.
      </p>
      <p className="auth-footer-note">
        لم يصلك البريد؟ تحقق من مجلد الرسائل غير المرغوب فيها، أو <Link href="/register">حاول التسجيل مرة أخرى</Link>.
      </p>
    </div>
  );
}

export default function VerifyEmailPage({ searchParams }) {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent searchParams={searchParams} />
    </Suspense>
  );
}
