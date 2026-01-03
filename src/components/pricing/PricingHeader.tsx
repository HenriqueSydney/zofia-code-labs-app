"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PricingHeaderProps {
  badge?: string;
  title: string;
  description: string;
  discountText?: string; // Ex: "-20%" ou "2 meses grátis"
}

export function PricingHeader({ 
  badge = "Preços transparentes", 
  title, 
  description, 
  discountText = "-20%" 
}: PricingHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const planType = searchParams.get("planType");
  const isYearly = planType === "yearly";

  function handleSetIsYearly() {
    const params = new URLSearchParams(searchParams);
    params.set("planType", isYearly ? "monthly" : "yearly");
    // Usamos scroll: false para não pular a página ao trocar o toggle
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="text-center max-w-4xl mx-auto mb-16">
      <Badge variant="secondary" className="mb-4 px-4 py-1">
        {badge}
      </Badge>
      
      <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-tight">
        {title}
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
        {description}
      </p>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-6 bg-muted/50 w-fit mx-auto p-2 rounded-full border border-border">
        <Label
          htmlFor="billing-toggle"
          className={`text-sm font-semibold transition-all cursor-pointer ${
            !isYearly ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Mensal
        </Label>
        
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={handleSetIsYearly}
          className="data-[state=checked]:bg-primary"
        />
        
        <div className="flex items-center gap-2">
          <Label
            htmlFor="billing-toggle"
            className={`text-sm font-semibold transition-all cursor-pointer ${
              isYearly ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Anual
          </Label>
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-bold bg-accent/10 text-accent border-accent/20 animate-pulse"
          >
            {discountText}
          </Badge>
        </div>
      </div>
    </div>
  );
}