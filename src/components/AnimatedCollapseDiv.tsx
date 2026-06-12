"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/utils/twMerge";

interface AnimatedCollapseDivProps {
  children: ReactNode;
  isOpen: boolean;
  className?: string;
  innerClassName?: string;
}

export function AnimatedCollapseDiv({
  children,
  isOpen,
  className,
  innerClassName,
}: AnimatedCollapseDivProps) {
  return (
    <motion.div
      initial={false}
      animate={
        isOpen
          ? { height: "auto", opacity: 1 }
          : { height: 0, opacity: 0 }
      }
      transition={{
        height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.25, ease: "easeInOut" },
      }}
      style={{ overflow: "hidden", transformOrigin: "top" }}
      className={className}
    >
      <motion.div
        initial={false}
        animate={isOpen ? { y: 0 } : { y: -8 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className={cn(innerClassName)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
