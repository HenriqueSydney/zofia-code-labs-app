import { AppError } from "@/errors/AppError";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

interface IEmptyState {
  title: string;
  description?: string;
  icon?: LucideIcon;
  image?: string;
  className?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  image,
  className,
}: IEmptyState) {
  if (!image && !Icon) {
    throw new AppError("Forneça uma Imagem ou um Icon para o EmptyState");
  }

  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col md:flex-row items-center justify-center md:gap-10",
        "rounded-xl border-2 border-dashed border-muted/50 bg-muted/10 p-8 text-center animate-in fade-in zoom-in duration-300",
        className
      )}
    >
      {Icon && (
        <div className="flex h-25 w-25 items-center justify-center rounded-full bg-muted/20 ring-8 ring-muted/5">
          <Icon className="h-15 w-15 text-muted-foreground/60" />
        </div>
      )}
      {image && (
        <div className="flex bg-white h-30 w-30 items-center justify-center rounded-full bg-muted/20 ring-8 ring-muted/5 p-2">
          <Image src={image} alt={title} width={400} height={400} />
        </div>
      )}

      <div className="flex flex-1 w-full h-full flex-col md:items-start items-center md:justify-start justify-center gap-3">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground md:text-left text-center leading-relaxed">
            {description}
          </p>
        )}
        {action && <div className="mt-8">{action}</div>}
      </div>
    </div>
  );
}
