export const CustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex justify-end gap-6 mb-4">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {entry.value === "pageViews" ? "Visualizações" : "Visitantes"}
          </span>
        </div>
      ))}
    </div>
  );
};
