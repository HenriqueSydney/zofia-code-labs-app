export function StatsCardsSkeleton() {
  return (
    <div className="bg-[#111827] border border-gray-800 p-4 rounded-lg animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-gray-700 rounded-md" />
        <div className="flex flex-col items-end gap-2">
          <div className="w-30 h-4 bg-gray-700 rounded" />
          <div className="w-18 h-8 bg-gray-800 rounded" />
          <div className="w-8 h-3 bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
}
