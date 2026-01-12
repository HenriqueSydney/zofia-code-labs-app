import { DonutChart } from "@/components/Charts/DonutChart";

const SEVERITY_COLORS: Record<string, string> = {
  Blocker: "hsl(var(--destructive))",
  Critical: "#ea580c",
  Major: "#f59e0b",
  Minor: "#eab308",
  Info: "#3b82f6",
};

export function SeverityDonutChart({ data }: { data: any[] }) {
  return (
    <DonutChart
      title="Issues por Severidade"
      description="Distribuição atual de problemas"
      data={data}
      colors={SEVERITY_COLORS}
    />
  );
}
