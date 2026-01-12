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
          {/* entry.value aqui será "Commits", conforme definido no seu UseCase/Componente */}
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};
