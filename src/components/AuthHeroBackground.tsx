import { cn } from "@/utils/twMerge";

const LOGIN_BACKGROUND_IMAGE = "/background.avif";

interface AuthHeroBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthHeroBackground({
  children,
  className,
}: AuthHeroBackgroundProps) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden lg:h-screen lg:max-h-screen", className)}>
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${LOGIN_BACKGROUND_IMAGE}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-background/70 to-background/90" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/25 to-background" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/95 to-transparent" />
      </div>

      <div className="relative z-10 lg:h-full">{children}</div>
    </div>
  );
}
