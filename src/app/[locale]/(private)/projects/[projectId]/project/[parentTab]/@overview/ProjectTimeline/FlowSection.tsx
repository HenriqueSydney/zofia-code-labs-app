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

  const arbitrarySum = isActiveFlow ? 100 / stages.length / 2 : 0;

  const progressWidth =
    (Math.min(stages.length, progressStart) / stages.length) * 100 +
    arbitrarySum;

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
          <div className="px-4 pb-4 pt-0 ">
            <div className="relative mt-2 ">
              {/* Progress Line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted-foreground/20 rounded-full" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-primary rounded-full transition-all duration-500"
                style={{
                  width: isCancelled ? "0%" : `calc(${progressWidth}%)`,
                }}
              />

              {/* Stage Points */}
              <div className="flex justify-between w-full items-start">
                {stages.map((stage, index) => {
                  const status = getStageStatus(stage);
                  const isLast = index === stages.length - 1;
                  const isFirst = index === 0;

                  return (
                    <div
                      key={stage.key}
                      className="relative flex-1 flex flex-col items-center"
                    >
                      {/* Container da Linha (Background) */}
                      <div className="absolute top-5 w-full flex items-center">
                        {/* Linha da Esquerda */}
                        <div
                          className={cn(
                            "h-0.5 flex-1",
                            isFirst
                              ? "bg-transparent"
                              : status === "completed" || status === "current"
                              ? "bg-primary"
                              : "bg-muted-foreground/20"
                          )}
                        />

                        {/* Espaço do Ícone (para a linha não atravessar o desenho) */}
                        <div className="w-10" />

                        {/* Linha da Direita */}
                        <div
                          className={cn(
                            "h-0.5 flex-1",
                            isLast
                              ? "bg-transparent"
                              : status === "completed"
                              ? "bg-primary"
                              : "bg-muted-foreground/20"
                          )}
                        />
                      </div>

                      {/* Ícone */}
                      <div
                        className={cn(
                          "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                          status === "completed" &&
                            "bg-primary border-primary text-white",
                          status === "current" &&
                            "bg-background border-primary text-primary ring-4 ring-primary/20",
                          status === "pending" &&
                            "bg-background border-muted-foreground/30 text-muted-foreground"
                        )}
                      >
                        {status === "completed" ? (
                          <CheckCheck size={20} />
                        ) : (
                          <stage.icon size={18} />
                        )}
                      </div>

                      {/* Label */}
                      <span className="mt-2 text-xs text-center font-medium">
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
