import { ReactNode } from "react";

import {
  Tooltip as ShadnTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: ReactNode;
  description?: ReactNode | string | null;
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
      <TooltipTrigger asChild={false}>     
        <div className="contents">
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent className={cn("max-w-2xl", className)} side={direction}>
        {/* Verifica se é string. Se for, usa o <p>. Se for ReactNode (JSX), renderiza direto. */}
        {typeof description === "string" ? (
          <p className="whitespace-pre-line">{description}</p>
        ) : (
          description
        )}
      </TooltipContent>
    </ShadnTooltip>
  );
}
