export function ListSkeleton() {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-lg p-6 animate-pulse">
      <div className="flex justify-between mb-6">
        <div className="w-64 h-6 bg-gray-700 rounded" />
        <div className="w-24 h-6 bg-gray-800 rounded-full" />
      </div>
      <div className="space-y-4">
        {/* Header da Tabela */}
        <div className="grid grid-cols-5 gap-4 pb-2 border-b border-gray-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-800 rounded w-20" />
          ))}
        </div>
        {/* Linhas */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-4 py-3 border-b border-gray-900/50 items-center"
          >
            <div className="h-6 bg-gray-800 rounded-full w-24" />
            <div className="h-5 bg-gray-800 rounded-full w-16" />
            <div className="h-4 bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-800 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
