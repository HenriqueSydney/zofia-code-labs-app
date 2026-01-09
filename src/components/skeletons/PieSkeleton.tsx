import { cn } from "@/lib/utils";

export function PieChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[#111827] border border-gray-800 p-6 rounded-lg h-[400px] flex flex-col items-center justify-center animate-pulse  h-full",
        className
      )}
    >
      <div className="self-start mb-8 space-y-2">
        <div className="w-48 h-5 bg-gray-700 rounded" />
        <div className="w-32 h-3 bg-gray-800 rounded" />
      </div>
      <div className="relative w-48 h-48 rounded-full border-[16px] border-gray-800 flex items-center justify-center">
        <div className="w-12 h-4 bg-gray-700 rounded" />
      </div>
    </div>
  );
}
