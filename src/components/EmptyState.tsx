import React from "react";

interface IEmptyState {
  title: string;
  description?: string;
  Icon?: React.ReactNode;
}

export function EmptyState({ title, description, Icon }: IEmptyState) {
  return (
    <div className="bg-card border rounded-xl w-full p-2 flex items-center justify-center gap-4 animate-slide-up">
      <div className="h-full p-10">{Icon && Icon}</div>
      <div className="flex flex-1 w-full h-full flex-col items-start justify-start gap-3">
        <strong className="text-weight-bold text-xl">{title}</strong>
        {description && (
          <span className="text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  );
}
