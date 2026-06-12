import { cn } from "@/utils/twMerge";

interface LoadingBarProps {
  className?: string;
}

export function LoadingBar({ className }: LoadingBarProps) {
  return (
    <div className={cn("w-full h-1 bg-muted overflow-hidden", className)}>
      <div
        className="h-full bg-gradient-to-r from-primary via-secondary to-primary animate-loading-bar"
        style={{
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}
