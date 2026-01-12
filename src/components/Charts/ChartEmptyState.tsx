import { Inbox } from "lucide-react";

interface ChartEmptyStateProps {
  message?: string;
  subtitle?: string;
}

export function ChartEmptyState({
  message = "Sem dados disponíveis",
  subtitle = "Nenhuma atividade detectada",
}: ChartEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-gray-500 animate-in fade-in duration-500 w-full h-full">
      <div className="bg-gray-800/50 p-4 rounded-full mb-3">
        <Inbox className="w-8 h-8 opacity-20" />
      </div>
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs opacity-50">{subtitle}</p>
    </div>
  );
}
