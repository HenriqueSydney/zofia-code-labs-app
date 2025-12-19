import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CheckCheck, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { FlowCategoryIndicator } from "./FlowCategoryIndicator";
import { ProjectStage } from "@/mappers/projectStageMapper";

interface StageConfig {
  key: ProjectStage;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  nextAction?: string;
}

interface IFlowSection {
  category: string;
  stages: StageConfig[];
  title: string;
  bgColor: string;
  currentStage: ProjectStage;
  isCancelled: boolean;
  allStages: StageConfig[];
  compact?: boolean;
  isInThisFlow?: boolean;
}

export const FlowSection = ({
  category,
  stages,
  title,
  bgColor,
  currentStage,
  isCancelled,
  allStages,
  compact = false,
  isInThisFlow = false,
}: IFlowSection) => {
  const currentIndex = allStages.findIndex((s) => s.key === currentStage);
  const isActiveFlow = stages.some((s) => s.key === currentStage);
  const [isOpen, setIsOpen] = useState(isActiveFlow);

  // Auto-open if the current stage moves into this flow
  useEffect(() => {
    if (isActiveFlow) {
      setIsOpen(true);
    }
  }, [isActiveFlow]);

  const getStageStatus = (stage: StageConfig) => {
    const stageIndex = allStages.findIndex((s) => s.key === stage.key);
    if (isCancelled) return "pending";
    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "current";
    return "pending";
  };

  const firstIndex = allStages.findIndex((s) => s.key === stages[0].key);
  // Calculate progress relative to this section
  const progressStart = Math.max(0, currentIndex - firstIndex);
  const progressWidth =
    (Math.min(stages.length - 1, progressStart) / (stages.length - 1)) * 100;

  return (
    <>
      <FlowCategoryIndicator
        isInOperational={isInThisFlow}
        category={category}
      />
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn("rounded-lg border border-transparent", bgColor)}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen ? "rotate-180" : ""
                )}
              />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0">
            <div className="relative mt-2">
              {/* Progress Line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted-foreground/20 rounded-full" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-primary rounded-full transition-all duration-500"
                style={{
                  width: isCancelled
                    ? "0%"
                    : `calc(${Math.max(
                        0,
                        Math.min(100, progressWidth)
                      )}% - 16px)`,
                }}
              />

              {/* Stage Points */}
              <div className="relative flex justify-between">
                {stages.map((stage) => {
                  const status = getStageStatus(stage);
                  const Icon = stage.icon;
                  return (
                    <div
                      key={stage.key}
                      className={`flex flex-col items-center ${
                        compact ? "w-16" : "flex-1"
                      }`}
                    >
                      <div
                        className={cn(
                          "relative z-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                          compact ? "w-8 h-8" : "w-10 h-10",
                          status === "completed" &&
                            "bg-primary border-primary text-primary-foreground",
                          status === "current" &&
                            `${stage.color} border-primary text-white ring-4 ring-primary/20`,
                          status === "pending" &&
                            "bg-background border-muted-foreground/30 text-muted-foreground"
                        )}
                      >
                        {status === "completed" ? (
                          <CheckCheck
                            className={compact ? "h-4 w-4" : "h-5 w-5"}
                          />
                        ) : (
                          <Icon className={compact ? "h-3 w-3" : "h-4 w-4"} />
                        )}
                      </div>
                      <span
                        className={cn(
                          "mt-2 text-center font-medium line-clamp-2 px-1",
                          compact ? "text-[10px]" : "text-xs",
                          status === "current"
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};
