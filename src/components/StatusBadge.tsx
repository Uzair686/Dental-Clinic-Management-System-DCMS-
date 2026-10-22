import type { ApptStatus } from "@/lib/clinic";
import { cn } from "@/lib/utils";

const STYLES: Record<ApptStatus, string> = {
  scheduled: "bg-muted text-muted-foreground",
  confirmed: "bg-accent text-accent-foreground",
  "in-progress": "bg-warning/20 text-warning-foreground",
  completed: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: ApptStatus }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", STYLES[status])}>
      {status.replace("-", " ")}
    </span>
  );
}
