import { Inbox, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="state-block">
      <Icon size={32} strokeWidth={1.5} className="state-block__icon" />
      <div className="state-block__title">{title}</div>
      {description ? <p className="state-block__description">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ title = "تعذّر تحميل المحتوى.", onRetry }) {
  return (
    <div className="state-block">
      <AlertTriangle size={32} strokeWidth={1.5} className="state-block__icon" />
      <div className="state-block__title">{title}</div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      ) : null}
    </div>
  );
}
