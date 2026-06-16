"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Mail,
  Sparkles,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AuthHeroBackground } from "@/components/AuthHeroBackground";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/twMerge";

export type PaymentConfirmationVariant = "success" | "processing" | "cancelled";

interface PaymentConfirmationViewProps {
  variant: PaymentConfirmationVariant;
  clientName: string;
  projectName: string;
  amount: string;
  paymentDate: string | null;
  paymentMethod: string;
  description: string;
  transactionId: string | null;
  isDownPayment: boolean;
  projectPaymentsHref: string;
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-400",
    ringClass: "from-emerald-400/30 via-primary/20 to-emerald-300/10",
    badgeClass: "bg-emerald-500/20 text-emerald-100 border-emerald-300/30",
    glowClass: "shadow-[0_0_80px_rgba(16,185,129,0.35)]",
    accentBar: "bg-gradient-to-r from-primary via-emerald-400 to-primary",
    amountBox:
      "border-emerald-200/40 bg-emerald-950/30 text-emerald-100 dark:border-emerald-900/40",
    amountLabel: "text-emerald-200/80",
    amountValue: "text-emerald-300",
  },
  processing: {
    icon: Clock3,
    iconClass: "text-amber-400",
    ringClass: "from-amber-400/30 via-primary/20 to-amber-300/10",
    badgeClass: "bg-amber-500/20 text-amber-100 border-amber-300/30",
    glowClass: "shadow-[0_0_80px_rgba(245,158,11,0.25)]",
    accentBar: "bg-gradient-to-r from-primary via-amber-400 to-primary",
    amountBox:
      "border-amber-200/40 bg-amber-950/30 text-amber-100 dark:border-amber-900/40",
    amountLabel: "text-amber-200/80",
    amountValue: "text-amber-300",
  },
  cancelled: {
    icon: XCircle,
    iconClass: "text-rose-400",
    ringClass: "from-rose-400/30 via-primary/20 to-rose-300/10",
    badgeClass: "bg-rose-500/20 text-rose-100 border-rose-300/30",
    glowClass: "shadow-[0_0_80px_rgba(244,63,94,0.25)]",
    accentBar: "bg-gradient-to-r from-primary via-rose-400 to-primary",
    amountBox:
      "border-rose-200/40 bg-rose-950/30 text-rose-100 dark:border-rose-900/40",
    amountLabel: "text-rose-200/80",
    amountValue: "text-rose-300",
  },
} as const;

export function PaymentConfirmationView({
  variant,
  clientName,
  projectName,
  amount,
  paymentDate,
  paymentMethod,
  description,
  transactionId,
  isDownPayment,
  projectPaymentsHref,
}: PaymentConfirmationViewProps) {
  const t = useTranslations("invoices.paymentConfirmation");
  const config = variantConfig[variant];
  const Icon = config.icon;
  const isCancelled = variant === "cancelled";

  return (
    <AuthHeroBackground>
      <div className="fixed bottom-4 right-4 z-20 rounded-2xl border border-white/20 bg-background/30 px-3 py-2 shadow-lg backdrop-blur-sm sm:bottom-5 sm:right-5">
        <Image
          src="/zofia-logo.webp"
          alt="Zofia Code Labs"
          width={220}
          height={120}
          className="h-auto w-24 sm:w-28"
          priority
        />
      </div>

      {variant === "success" && <FloatingParticles className="z-0" />}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-start px-6 pb-28 pt-10 sm:pb-32 sm:pt-14 lg:h-full lg:max-h-full lg:min-h-0 lg:justify-center lg:overflow-hidden lg:px-8 lg:pb-8 lg:pt-8">
        <motion.div
          initial={{ opacity: 1, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-6 flex w-full shrink-0 flex-col items-center text-center sm:mb-8 lg:mb-6"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 16,
              delay: 0.1,
            }}
            className={cn(
              "relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br sm:mb-5 sm:h-28 sm:w-28 lg:mb-4 lg:h-24 lg:w-24",
              config.ringClass,
              config.glowClass,
            )}
          >
            <motion.div
              animate={
                variant === "processing"
                  ? { rotate: 360 }
                  : isCancelled
                    ? { scale: [1, 0.96, 1] }
                    : { scale: [1, 1.05, 1] }
              }
              transition={
                variant === "processing"
                  ? { duration: 2.8, repeat: Infinity, ease: "linear" }
                  : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Icon
                className={cn("h-14 w-14 sm:h-16 sm:w-16", config.iconClass)}
              />
            </motion.div>
            {variant === "success" && (
              <Sparkles className="absolute -right-1 -top-1 h-6 w-6 text-amber-300" />
            )}
          </motion.div>

          <Badge
            className={cn(
              "mb-4 px-3 py-1 text-xs font-semibold",
              config.badgeClass,
            )}
          >
            {t(`badge.${variant}`)}
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t(`title.${variant}`)}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 1, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
          className="flex w-full min-h-0 flex-1 flex-col lg:overflow-hidden"
        >
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-border/50 bg-card/80 shadow-2xl backdrop-blur-md lg:max-h-full">
            <div className={cn("h-1.5 shrink-0", config.accentBar)} />
            <CardHeader className="shrink-0 space-y-2 px-6 pb-4 pt-6 text-center">
              <CardTitle className="text-xl">
                {isCancelled ? t("receipt.cancelledTitle") : t("receipt.title")}
              </CardTitle>
              <CardDescription>
                {isDownPayment
                  ? t("receipt.downPayment")
                  : t("receipt.standard")}
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-6 pt-0">
              {isCancelled && (
                <div className="rounded-2xl border border-rose-200/50 bg-rose-50/80 p-5 dark:border-rose-900/40 dark:bg-rose-950/30">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                    <div className="space-y-1 text-left">
                      <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                        {t("cancelled.helpTitle")}
                      </p>
                      <p className="text-sm leading-relaxed text-rose-700/90 dark:text-rose-300/90">
                        {t("cancelled.helpDescription")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className={cn("rounded-2xl border p-5", config.amountBox)}>
                <p
                  className={cn(
                    "text-xs font-semibold uppercase tracking-[0.2em]",
                    config.amountLabel,
                  )}
                >
                  {isCancelled
                    ? t("receipt.amountDue")
                    : t("receipt.amountPaid")}
                </p>
                <p
                  className={cn("mt-2 text-4xl font-bold", config.amountValue)}
                >
                  {amount}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem label={t("receipt.project")} value={projectName} />
                <DetailItem label={t("receipt.client")} value={clientName} />
                <DetailItem label={t("receipt.method")} value={paymentMethod} />
                <DetailItem
                  label={t("receipt.date")}
                  value={
                    isCancelled
                      ? t("receipt.dateNotCompleted")
                      : (paymentDate ?? t("receipt.datePending"))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("receipt.services")}
                </p>
                <p className="text-sm leading-relaxed text-foreground">
                  {description}
                </p>
              </div>

              {transactionId && !isCancelled && (
                <div className="overflow-x-auto rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("receipt.transactionId")}
                  </p>
                  <p className="mt-1 w-max max-w-full font-mono text-sm text-foreground whitespace-nowrap">
                    {transactionId}
                  </p>
                </div>
              )}

              <div className="flex shrink-0 flex-col gap-3 pt-2 sm:flex-row">
                {!isCancelled && (
                  <Button asChild className="flex-1">
                    <Link href={projectPaymentsHref}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t("actions.viewPayments")}
                    </Link>
                  </Button>
                )}
                <Button
                  asChild
                  variant={isCancelled ? "default" : "outline"}
                  className="flex-1"
                >
                  <Link href="/auth/login">
                    {isCancelled
                      ? t("actions.goToLoginCancelled")
                      : t("actions.goToLogin")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <p className="relative z-10 mt-8 shrink-0 text-center text-sm text-white/60">
          {isCancelled ? t("cancelled.footer") : t("footer")}
        </p>
      </div>
    </AuthHeroBackground>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
