import { ReactNode } from "react";

import {
  Tooltip as ShadnTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: ReactNode;
  description?: string | null;
  className?: string;
  direction?: "right" | "left" | "bottom" | "top";
}

export function Tooltip({
  children,
  description,
  className,
  direction = "right",
}: TooltipProps) {
  if (!description) return children;
  return (
    <ShadnTooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        className={cn("max-w-2xl whitespace-pre-line", className)}
        side={direction}
      >
        <p className="whitespace-pre-line">{description}</p>
      </TooltipContent>
    </ShadnTooltip>
  );
}
