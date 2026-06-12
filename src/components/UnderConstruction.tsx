import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/twMerge";
import { Construction, Hammer, Sparkles, Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";

export interface UnderConstructionProps {
  featureTitle?: string;
  className?: string;
}

export async function UnderConstruction({
  featureTitle,
  className,
}: UnderConstructionProps) {
  const t = await getTranslations("common.underConstruction");

  return (
    <div
      className={cn(
        "relative flex min-h-[min(70vh,640px)] w-full items-center justify-center overflow-hidden rounded-2xl border bg-card p-6 sm:p-10",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_55%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:28px_28px]"
      />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border bg-background/80 shadow-xl backdrop-blur-sm">
            <Construction className="h-14 w-14 text-primary" strokeWidth={1.5} />
            <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-amber-500 animate-pulse" />
            <Wrench className="absolute -bottom-1 -left-2 h-5 w-5 rotate-[-24deg] text-violet-500" />
          </div>
        </div>

        <Badge
          variant="secondary"
          className="mb-4 gap-1.5 border-primary/20 bg-primary/5 px-3 py-1 text-primary"
        >
          <Hammer className="h-3.5 w-3.5" />
          {t("badge")}
        </Badge>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {featureTitle ? t("titleWithFeature", { feature: featureTitle }) : t("title")}
        </h1>

        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("description")}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {[t("chip.design"), t("chip.backend"), t("chip.launch")].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-dashed border-muted-foreground/30 bg-background/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
