import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface IFlowCategoryIndicator {
  category: string;
  isInOperational: boolean;
}

export function FlowCategoryIndicator({
  category,
  isInOperational,
}: IFlowCategoryIndicator) {
  return (
    <div className="flex items-center gap-3 px-4">
      <div className="flex-1 h-px bg-border" />
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
          isInOperational
            ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-muted text-muted-foreground"
        )}
      >
        <ArrowRight className="h-3 w-3" />
        <span>{category}</span>
        <ArrowRight className="h-3 w-3" />
      </div>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
