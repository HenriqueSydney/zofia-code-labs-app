"use client";

import { AnimatedCollapseDiv } from "@/components/AnimatedCollapseDiv";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface UserProfileSectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function UserProfileSectionCard({
  title,
  icon,
  children,
  collapsible = false,
  defaultOpen = false,
}: UserProfileSectionCardProps) {
  const t = useTranslations("userProfile.sectionCard");
  const [open, setOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <div className="bg-card rounded-2xl shadow-xl p-8 mb-6 border border">
        <div className="flex items-center space-x-3 mb-6">
          {icon}
          <h3 className="text-2xl font-bold text-primary">{title}</h3>
        </div>
        {children}
      </div>
    );
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="bg-card rounded-2xl shadow-xl p-8 mb-6 border border"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full cursor-pointer">
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-2xl font-bold text-primary">{title}</h3>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="inline-flex shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.span>
        <span className="sr-only">{t("toggle")}</span>
      </CollapsibleTrigger>

      <CollapsibleContent forceMount asChild>
        <div>
          <AnimatedCollapseDiv isOpen={open} innerClassName="pt-6">
            {children}
          </AnimatedCollapseDiv>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
