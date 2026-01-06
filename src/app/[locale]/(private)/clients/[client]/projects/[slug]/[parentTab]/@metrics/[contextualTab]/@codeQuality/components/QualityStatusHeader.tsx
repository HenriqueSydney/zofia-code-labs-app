import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface QualityStatusHeaderProps {
  status: "OK" | "ERROR" | "WARN";
  rating: string;
}

export function QualityStatusHeader({
  status,
  rating,
}: QualityStatusHeaderProps) {
  // Mapeamento de cores para o Rating (A, B, C...)
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

  const isPassed = status === "OK";

  return (
    <div className="flex items-center gap-6">
      {/* Bloco do Rating */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          Global Rating
        </span>
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 text-md font-bold uppercase tracking-tight shadow-sm",
            getRatingColors(rating)
          )}
        >
          {rating}
        </Badge>
      </div>
      {/* Divisor vertical sutil */}
      <div className="h-10 w-[1px] bg-border/50" />
      {/* Bloco do Quality Gate */}
      <div className="flex flex-col items-start gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          Quality Gate
        </span>
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 text-md font-bold uppercase tracking-tight shadow-sm",
            isPassed
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
              : "border-red-500/50 bg-red-500/10 text-red-500"
          )}
        >
          {isPassed ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Passed
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" />
              Failed
            </>
          )}
        </Badge>
      </div>
    </div>
  );
}
