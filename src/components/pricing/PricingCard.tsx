"use client";

import { PricingPlan } from "@/@types/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface IPrincingCard {
  plan: PricingPlan;
  isYearly: boolean;
}

export function PrincingCard({ plan, isYearly }: IPrincingCard) {
  const t = useTranslations("components.pricing");
  const Icon = plan.icon as unknown as LucideIcon;
  const price = isYearly ? plan.price.yearly : plan.price.monthly;
  const isIndicated = plan.isIndicated;

  return (
    <Card
      key={plan.id}
      className={`relative flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isIndicated
          ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
          : "border-border"
      }`}
    >
      {isIndicated && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md border-none">
            {t("card.recommended")}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div
          className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 ${
            isIndicated
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="text-sm min-h-[40px] leading-relaxed">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="text-center mb-6">
          {price !== null ? (
            <>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-sm text-muted-foreground font-medium">
                  R$
                </span>
                <span className="text-4xl font-extrabold text-foreground tracking-tight">
                  {price}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {isYearly ? t("card.perYear") : t("card.perMonth")}
              </span>
              {isYearly && plan.price.monthly && (
                <p className="text-xs text-emerald-500 font-medium mt-1">
                  {t("card.yearlySavings", {
                    amount: plan.price.monthly * 12 - (plan.price.yearly ?? 0),
                  })}
                </p>
              )}
            </>
          ) : (
            <div className="py-2">
              <span className="text-2xl font-bold text-foreground">
                {t("card.contactUs")}
              </span>
            </div>
          )}
        </div>

        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <Check
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  feature.included ? "text-primary" : "text-muted-foreground/30"
                }`}
              />
              <span
                className={
                  feature.included
                    ? "text-foreground"
                    : "text-muted-foreground line-through"
                }
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        {plan.dataPoints.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              {t("card.includedMetrics")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {plan.dataPoints.map((point, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[10px] font-normal py-0 px-2"
                >
                  {point}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          variant={isIndicated ? "default" : plan.ctaVariant}
          className={`w-full font-bold ${
            isIndicated
              ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-md transition-all"
              : ""
          }`}
        >
          {plan.buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
