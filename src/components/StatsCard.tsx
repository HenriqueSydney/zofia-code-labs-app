import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Ajustado para o padrão comum do shadcn
import { LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface IStatsCard {
  label: string;
  mainInformation: string | number;
  Icon: LucideIcon;
  trend?: number;
  reverseColor?: boolean; // Default true: subir é ruim (ex: bugs). False: subir é bom (ex: coverage).
  iconColor?:
    | "bg-primary/10"
    | "bg-accent/10"
    | "bg-blue-500/10"
    | "bg-orange-500/10"
    | "bg-green-500/10"
    | "bg-destructive/10";
}

export function StatsCard({
  label,
  mainInformation,
  Icon,
  trend,
  reverseColor = true,
  iconColor = "bg-primary/10",
}: IStatsCard) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  const isNeutral = typeof trend === "number" && trend === 0;

  // Lógica de cores para o trend
  // Se reverseColor for true (ex: Bugs), subir (+) é vermelho.
  // Se reverseColor for false (ex: Coverage), subir (+) é verde.
  const getTrendStyles = () => {
    if (isNeutral) return "text-muted-foreground";
    const isGood = reverseColor ? isNegative : isPositive;
    return isGood ? "text-green-600" : "text-destructive";
  };

  // Extrair a cor do texto baseada na cor do fundo para o ícone
  const getIconTextColor = () => {
    const colorMap: Record<string, string> = {
      "bg-primary/10": "text-primary",
      "bg-destructive/10": "text-destructive",
      "bg-orange-500/10": "text-orange-500",
      "bg-blue-500/10": "text-blue-500",
      "bg-green-500/10": "text-green-500",
    };
    return colorMap[iconColor] || "text-primary";
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-3 rounded-lg", iconColor)}>
          <Icon className={cn("h-6 w-6", getIconTextColor())} />
        </div>
        <div className="w-full flex flex-col items-end  justify-end">
          <p className="text-sm text-muted-foreground leading-none mb-1">
            {label}
          </p>
          <div className="w-full flex flex-col gap-2 items-end  justify-end">
            <p className="text-2xl font-bold">{mainInformation}</p>

            {/* Secondary Information (Trend) */}
            <div
              className={cn(
                "w-full flex items-center justify-end text-xs font-medium",
                getTrendStyles()
              )}
            >
              {isPositive && <TrendingUp className="h-3 w-3 mr-0.5" />}
              {isNegative && <TrendingDown className="h-3 w-3 mr-0.5" />}
              {isNeutral && <Minus className="h-3 w-3 mr-0.5" />}
              {trend !== undefined && (
                <span>{isNeutral ? "estável" : `${Math.abs(trend)}%`}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
