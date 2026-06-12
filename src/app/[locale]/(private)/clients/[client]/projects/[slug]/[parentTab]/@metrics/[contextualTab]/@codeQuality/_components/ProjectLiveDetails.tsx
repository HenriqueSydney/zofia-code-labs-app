"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QualityGateTable } from "./QualityGateTable";
import { RecentIssuesTable } from "./RecentIssuesTable";
import { cn } from "@/utils/twMerge";
import { useTranslations } from "next-intl";

interface ProjectLiveDetailsProps {
  issues: any[];
  qualityGate: any[];
}

export function ProjectLiveDetails({
  issues,
  qualityGate,
}: ProjectLiveDetailsProps) {
  const t = useTranslations("projects.metrics.codeQuality.projectLive");
  const [showIssues, setShowIssues] = useState(true);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle>
            {showIssues ? t("issuesTitle") : t("gateTitle")}
          </CardTitle>
          <CardDescription>
            {showIssues ? t("issuesDescription") : t("gateDescription")}
          </CardDescription>
        </div>

        <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg">
          <Label
            htmlFor="view-mode"
            className={cn(
              "text-xs text-muted-foreground",
              !showIssues && "text-primary",
            )}
          >
            {t("gateLabel")}
          </Label>
          <Switch
            id="view-mode"
            className="bg-primary!"
            checked={showIssues}
            onCheckedChange={setShowIssues}
          />
          <Label
            htmlFor="view-mode"
            className={cn(
              "text-xs text-muted-foreground",
              showIssues && "text-primary",
            )}
          >
            {t("issuesLabel")}
          </Label>
        </div>
      </CardHeader>
      <CardContent>
        {showIssues ? (
          <RecentIssuesTable issues={issues} />
        ) : (
          <QualityGateTable conditions={qualityGate} />
        )}
      </CardContent>
    </Card>
  );
}
