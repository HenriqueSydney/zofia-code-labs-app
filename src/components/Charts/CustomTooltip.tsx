export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
        <p className="text-slate-400 text-xs mb-2 font-medium">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2">
              {/* O Recharts injeta a cor da linha/área no 'color' ou 'fill' */}
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <p className="text-sm text-white">
                <span className="font-bold">{entry.value}</span> {entry.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
