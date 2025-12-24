import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  description: string;
}

export const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  children,
  description,
}: ToolbarButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant={isActive ? "secondary" : "ghost"}
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        disabled={disabled}
        aria-label={description}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="top">
      <p>{description}</p>
    </TooltipContent>
  </Tooltip>
);
