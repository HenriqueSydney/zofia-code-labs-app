"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/twMerge";

const DEFAULT_PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 17) % 84)}%`,
  delay: (index % 6) * 0.35,
  duration: 4 + (index % 4),
  size: 6 + (index % 3) * 2,
}));

interface FloatingParticlesProps {
  className?: string;
  particleClassName?: string;
  count?: number;
}

export function FloatingParticles({
  className,
  particleClassName = "bg-primary/40",
  count = DEFAULT_PARTICLES.length,
}: FloatingParticlesProps) {
  const particles = DEFAULT_PARTICLES.slice(0, count);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className={cn(
            "absolute bottom-0 rounded-full",
            particleClassName,
          )}
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -120, -240],
            opacity: [0, 0.9, 0],
            scale: [0.4, 1, 0.6],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
