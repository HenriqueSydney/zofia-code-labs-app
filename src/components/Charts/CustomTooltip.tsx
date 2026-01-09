export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload?.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
        <p className="text-slate-400 text-xs mb-2 font-medium">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <p className="text-sm text-white">
              <span className="font-bold">{payload[0]?.value}</span> Page Views
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <p className="text-sm text-white">
              <span className="font-bold">{payload[1]?.value}</span> Visitantes
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
