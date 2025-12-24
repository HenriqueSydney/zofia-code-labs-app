"use client";

import React, { useState, useRef, useEffect } from "react";

interface RulerProps {
  marginLeft: number; // em cm
  marginRight: number; // em cm
  onMarginChange: (left: number, right: number) => void;
}

export const Ruler: React.FC<RulerProps> = ({
  marginLeft,
  marginRight,
  onMarginChange,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<"left" | "right" | null>(null);

  // Gera os marcadores de 1cm (total 21cm para A4)
  const ticks = Array.from({ length: 22 }, (_, i) => i);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !rulerRef.current) return;

    const rect = rulerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newValueInCm = Math.max(0, Math.min(21, (offsetX / rect.width) * 21));

    if (isDragging === "left") {
      // Impede que a margem esquerda ultrapasse a direita
      const clampedLeft = Math.min(newValueInCm, 21 - marginRight - 1);
      onMarginChange(clampedLeft, marginRight);
    } else {
      // Impede que a margem direita ultrapasse a esquerda
      const clampedRight = Math.min(21 - newValueInCm, 21 - marginLeft - 1);
      onMarginChange(marginLeft, clampedRight);
    }
  };

  const handleMouseUp = () => setIsDragging(null);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, marginLeft, marginRight]);

  return (
    <div
      ref={rulerRef}
      className="relative w-full h-8 bg-background border-x select-none flex items-end pb-1 sh"
      style={{ width: "21cm" }}
    >
      {/* Marcadores de CM */}
      {ticks.map((tick) => (
        <div
          key={tick}
          className="absolute border-l border-gray-400 h-2 flex flex-col justify-end"
          style={{ left: `${(tick / 21) * 100}%` }}
        >
          {tick % 2 === 0 && (
            <span className="text-[8px] absolute -left-1 -top-4 text-white">
              {tick}
            </span>
          )}
        </div>
      ))}

      {/* Área Ativa (Branca) vs Margens (Cinza) */}
      <div
        className="absolute h-full bg-accent/10 pointer-events-none"
        style={{
          left: `${(marginLeft / 21) * 100}%`,
          right: `${(marginRight / 21) * 100}%`,
          top: 0,
          bottom: 0,
        }}
      />

      {/* Handle Esquerdo */}
      <div
        onMouseDown={() => setIsDragging("left")}
        className="absolute bottom-0 cursor-col-resize z-10 transform -translate-x-1/2"
        style={{ left: `${(marginLeft / 21) * 100}%` }}
      >
        <div className="w-2 h-4 bg-primary rounded-t-sm clip-path-triangle shadow-sm" />
      </div>

      {/* Handle Direito */}
      <div
        onMouseDown={() => setIsDragging("right")}
        className="absolute bottom-0 cursor-col-resize z-10 transform translate-x-1/2"
        style={{ right: `${(marginRight / 21) * 100}%` }}
      >
        <div className="w-2 h-4 bg-primary rounded-t-sm clip-path-triangle shadow-sm" />
      </div>
    </div>
  );
};
