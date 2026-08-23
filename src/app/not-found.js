import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="auth-layout">
      <div className="state-block">
        <FileQuestion size={32} strokeWidth={1.5} className="state-block__icon" />
        <div className="state-block__title">الصفحة غير موجودة</div>
        <p className="state-block__description">الرابط الذي حاولت الوصول إليه غير موجود أو تم حذفه.</p>
        <Link href="/">
          <Button variant="outline">العودة إلى الرئيسية</Button>
        </Link>
      </div>
    </div>
  );
}
