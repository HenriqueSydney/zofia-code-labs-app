import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/twMerge";
import { CheckCircle2, XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCachedSonarMetrics } from "../_data/get-sonarqube-metrics";

interface QualityStatusHeaderProps {
  slug: string;
}

export async function QualityStatusHeader({ slug }: QualityStatusHeaderProps) {
  const t = await getTranslations("projects.metrics.codeQuality.status");
  const metrics = await getCachedSonarMetrics(slug);
  const rating = metrics.securityRating;

  const getRatingColors = (r: string) => {
    const colors: Record<string, string> = {
      A: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
      B: "text-green-400 border-green-400/30 bg-green-400/10",
      C: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
      D: "text-orange-400 border-orange-400/30 bg-orange-400/10",
      E: "text-red-400 border-red-400/30 bg-red-400/10",
    };
    return colors[r] || "text-slate-400 border-slate-400/30 bg-slate-400/10";
  };

  const isPassed = metrics.status === "OK";

  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          {t("globalRating")}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 text-md font-bold uppercase tracking-tight shadow-sm",
            getRatingColors(rating),
          )}
        >
          {rating}
        </Badge>
      </div>
      <div className="h-10 w-[1px] bg-border/50" />
      <div className="flex flex-col items-start gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          {t("qualityGate")}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 text-md font-bold uppercase tracking-tight shadow-sm",
            isPassed
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
              : "border-red-500/50 bg-red-500/10 text-red-500",
          )}
        >
          {isPassed ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("passed")}
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" />
              {t("failed")}
            </>
          )}
        </Badge>
      </div>
    </div>
  );
}
