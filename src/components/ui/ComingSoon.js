import { Hammer } from "lucide-react";
import { EmptyState } from "@/components/ui/States";

export function ComingSoon({ title, description }) {
  return (
    <div className="card">
      <EmptyState icon={Hammer} title={title} description={description} />
    </div>
  );
}
