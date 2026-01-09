import { cn } from "@/lib/utils";

export function LineChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[#111827] border border-gray-800 p-6 rounded-lg h-[300px] flex flex-col gap-4 animate-pulse w-full h-full",
        className
      )}
    >
      <div className="space-y-2">
        <div className="w-40 h-5 bg-gray-700 rounded" />
        <div className="w-32 h-3 bg-gray-800 rounded" />
      </div>
      <div className="flex-1 w-full bg-gray-900/50 rounded flex items-end justify-around p-4 gap-2">
        {/* Simulação de barras/linhas */}
        {[...Array(6)].map((_, j) => (
          <div
            key={j}
            className="w-full bg-gray-800 rounded-t"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}
