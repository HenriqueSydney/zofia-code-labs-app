import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/twMerge";
import { LucideIcon } from "lucide-react";

interface IStatsCard {
  label: string;
  mainInformation: string;
  Icon: LucideIcon;
  iconColor?: "bg-primary/10" | "bg-accent/10";
}

export function StatsCard({
  label,
  mainInformation,
  Icon,
  iconColor = "bg-primary/10",
}: IStatsCard) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-3 rounded-lg bg-primary/10", iconColor)}>
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-semibold">{mainInformation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
