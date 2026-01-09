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
import { cn } from "@/lib/utils";

interface ProjectLiveDetailsProps {
  issues: any[];
  qualityGate: any[];
}

export function ProjectLiveDetails({
  issues,
  qualityGate,
}: ProjectLiveDetailsProps) {
  const [showIssues, setShowIssues] = useState(true);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle>
            {showIssues
              ? "Problemas Identificados"
              : "Condições do Quality Gate"}
          </CardTitle>
          <CardDescription>
            {showIssues
              ? "Lista das 5 últimas issues detectadas na análise dinâmica."
              : "Critérios de aceitação definidos para o projeto."}
          </CardDescription>
        </div>

        <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg">
          <Label
            htmlFor="view-mode"
            className={cn(
              "text-xs text-muted-foreground",
              !showIssues && "text-primary"
            )}
          >
            Gate
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
              showIssues && "text-primary"
            )}
          >
            Issues
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
