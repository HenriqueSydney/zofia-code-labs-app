"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/twMerge";

interface ChartContainerProps {
  height: number;
  className?: string;
  children: (size: { width: number; height: number }) => ReactNode;
}

export function ChartContainer({
  height,
  className,
  children,
}: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateSize = () => {
      const { width, height: measuredHeight } = node.getBoundingClientRect();
      if (width > 0 && measuredHeight > 0) {
        setSize({ width, height: measuredHeight });
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height, minHeight: height }}
      className={cn("w-full min-w-0", className)}
    >
      {size ? children(size) : null}
    </div>
  );
}
