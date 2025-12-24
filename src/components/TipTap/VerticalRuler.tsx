"use client";

import React, { useState, useRef, useEffect } from "react";

interface VerticalRulerProps {
  marginTop: number; // em cm
  marginBottom: number; // em cm
  onMarginChange: (top: number, bottom: number) => void;
}

export const VerticalRuler: React.FC<VerticalRulerProps> = ({
  marginTop,
  marginBottom,
  onMarginChange,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<"top" | "bottom" | null>(null);

  // Gera marcadores de 1cm até 29.7cm (altura A4)
  const ticks = Array.from({ length: 30 }, (_, i) => i);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !rulerRef.current) return;

    const rect = rulerRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    // Converte a posição do mouse (pixels) para cm baseado na altura real do componente
    const newValueInCm = Math.max(
      0,
      Math.min(29.7, (offsetY / rect.height) * 29.7)
    );

    if (isDragging === "top") {
      // Impede que a margem superior encontre a inferior (mantém 1cm de folga)
      const clampedTop = Math.min(newValueInCm, 29.7 - marginBottom - 1);
      onMarginChange(clampedTop, marginBottom);
    } else {
      // Impede que a margem inferior encontre a superior
      const clampedBottom = Math.min(29.7 - newValueInCm, 29.7 - marginTop - 1);
      onMarginChange(marginTop, clampedBottom);
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
  }, [isDragging, marginTop, marginBottom]);

  return (
    <div
      ref={rulerRef}
      className="relative w-8 h-[29.7cm]  bg-background border-y  select-none flex flex-row items-start pr-1"
    >
      {/* Marcadores de CM (Ticks Verticais) */}
      {ticks.map((tick) => (
        <div
          key={tick}
          className="absolute border-t border-gray-400 w-2 flex flex-row justify-end"
          style={{ top: `${(tick / 29.7) * 100}%` }}
        >
          {tick % 2 === 0 && (
            <span className="text-[8px] absolute -top-1 -left-4 text-white">
              {tick}
            </span>
          )}
        </div>
      ))}

      {/* Área Ativa (Realce visual das margens) */}
      <div
        className="absolute w-full bg-accent/10 pointer-events-none"
        style={{
          top: `${(marginTop / 29.7) * 100}%`,
          bottom: `${(marginBottom / 29.7) * 100}%`,
          left: 0,
          right: 0,
        }}
      />

      {/* Handle Superior (Triângulo apontando para baixo) */}
      <div
        onMouseDown={() => setIsDragging("top")}
        className="absolute right-0 cursor-row-resize z-10 transform translate-y-[-50%]"
        style={{ top: `${(marginTop / 29.7) * 100}%` }}
      >
        <div className="w-2 h-3 bg-primary rounded-l-sm clip-path-v-triangle-top shadow-sm" />
      </div>

      {/* Handle Inferior (Triângulo apontando para cima) */}
      <div
        onMouseDown={() => setIsDragging("bottom")}
        className="absolute right-0 cursor-row-resize z-10 transform translate-y-[50%]"
        style={{ bottom: `${(marginBottom / 29.7) * 100}%` }}
      >
        <div className="w-2 h-3 bg-primary rounded-l-sm clip-path-v-triangle-bottom shadow-sm" />
      </div>
    </div>
  );
};
