import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/src/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 border rounded-lg border-dashed bg-card flex flex-col items-center px-4", className)}>
      <Icon className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm mb-0">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
