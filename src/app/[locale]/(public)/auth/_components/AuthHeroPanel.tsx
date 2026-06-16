"use client";

import Image from "next/image";
import { FloatingParticles } from "@/components/FloatingParticles";

const AUTH_BACKGROUND_IMAGE = "/background.avif";

interface AuthHeroPanelProps {
  tagline: string;
}

export function AuthHeroPanel({ tagline }: AuthHeroPanelProps) {
  return (
    <div className="relative h-64 overflow-hidden lg:h-auto lg:w-2/3">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${AUTH_BACKGROUND_IMAGE}')` }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-background/70 to-background/90" />
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />

      <FloatingParticles className="z-[1]" particleClassName="bg-primary/40" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center p-8 lg:p-16">
        <div className="mb-4 rounded-lg border border-border/50 bg-background/20 px-4 backdrop-blur-sm">
          <Image
            src="/zofia-logo.webp"
            alt="Zofia Code Labs"
            width={677}
            height={369}
            className="h-auto w-64 max-w-full"
          />
        </div>

        <p className="max-w-lg text-center text-base font-bold text-white/80 lg:text-xl">
          {tagline}
        </p>
      </div>

      <div className="absolute top-0 right-0 hidden h-full w-16 lg:block">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full"
          style={{ filter: "drop-shadow(4px 0 8px rgba(0,0,0,0.3))" }}
        >
          <path
            d="M0,0 L100,0 L100,100 L0,100 
               L15,95 L5,90 L20,85 L8,80 L18,75 L3,70 L15,65 L7,60 L20,55 L5,50 
               L18,45 L8,40 L15,35 L3,30 L20,25 L7,20 L15,15 L5,10 L18,5 Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 h-8 w-full lg:hidden">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full"
          style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
        >
          <path
            d="M0,0 L0,100 L100,100 L100,0 
               L95,15 L90,5 L85,20 L80,8 L75,18 L70,3 L65,15 L60,7 L55,20 L50,5 
               L45,18 L40,8 L35,15 L30,3 L25,20 L20,7 L15,15 L10,5 L5,18 Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </div>
  );
}
