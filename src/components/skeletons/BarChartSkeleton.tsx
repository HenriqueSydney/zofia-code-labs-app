import { cn } from "@/lib/utils";

export function BarChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[#111827] border border-gray-800 p-6 rounded-lg w-full h-[350px] flex flex-col animate-pulse",
        className
      )}
    >
      {/* Título e Subtítulo */}
      <div className="mb-8 space-y-2">
        <div className="h-5 bg-gray-700 rounded w-48" />
        <div className="h-3 bg-gray-800 rounded w-64" />
      </div>

      <div className="flex-1 flex items-end gap-3 w-full px-2">
        {/* Eixo Y (Linhas de grade laterais) */}
        <div className="flex flex-col justify-between h-full pb-6 pr-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-2 bg-gray-800 rounded w-6" />
          ))}
        </div>

        {/* Área das Barras */}
        <div className="flex-1 h-full flex items-end justify-around border-l border-b border-gray-800 pb-2">
          {/* Gerando 8 barras com alturas variadas para parecer real */}
          {[40, 70, 45, 90, 65, 30, 85, 50].map((height, i) => (
            <div
              key={i}
              className="w-full max-w-[40px] bg-gray-800/60 rounded-t-sm transition-all"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      {/* Eixo X (Labels de data/categoria) */}
      <div className="flex justify-around ml-10 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-3 bg-gray-800 rounded w-12" />
        ))}
      </div>
    </div>
  );
}
