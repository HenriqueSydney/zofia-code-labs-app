import { ReactNode } from "react";

interface ISectionHeading {
  title: string;
  description?: string;
  marginBottom?: string;
  badge?: ReactNode;
  subDescription?: string;
}

export function SectionHeading({
  title,
  description,
  marginBottom = "mb-8",
  badge,
  subDescription,
}: ISectionHeading) {
  return (
    <div className={marginBottom}>
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {badge}
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
      {subDescription && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground/60">
            {subDescription}
          </span>
        </p>
      )}
    </div>
  );
}
