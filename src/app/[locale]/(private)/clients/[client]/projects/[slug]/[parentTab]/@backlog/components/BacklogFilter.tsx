"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { QueryFilter } from "@/components/QueryFilter";
import { usePathname } from "@/i18n/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BacklogCreateForm } from "./BacklogCreateForm";
import { cn } from "@/utils/twMerge";

interface IBacklogFilter {
  projectId: string;
  canManageBacklog: boolean;
}

export function BacklogFilter({ projectId, canManageBacklog }: IBacklogFilter) {
  const t = useTranslations("projects.backlog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterStatus = (statusValue: string) => {
    const params = new URLSearchParams(searchParams);
    if (statusValue === "ALL") {
      params.delete("status");
    } else {
      params.set("status", statusValue);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFilterPriority = (priorityValue: string) => {
    const params = new URLSearchParams(searchParams);
    if (priorityValue === "ALL") {
      params.delete("priority");
    } else {
      params.set("priority", priorityValue);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const statusesOptions = [
    { value: "ALL", label: t("filter.status.all") },
    { value: "TODO", label: t("filter.status.todo") },
    { value: "IN_PROGRESS", label: t("filter.status.inProgress") },
    { value: "REVIEW", label: t("filter.status.review") },
    { value: "DONE", label: t("filter.status.done") },
  ];

  const priorityOptions = [
    { value: "ALL", label: t("filter.priority.all") },
    { value: "HIGH", label: t("filter.priority.high") },
    { value: "MEDIUM", label: t("filter.priority.medium") },
    { value: "LOW", label: t("filter.priority.low") },
  ];

  return (
    <Card>
      <CardContent className="p-3 flex items-center justify-center">
        <div
          className={cn(
            "w-full items-center justify-center grid grid-cols-1 lg:grid-cols-5 gap-6",
            !canManageBacklog && "lg:grid-cols-4",
          )}
        >
          <div className="col-span-2">
            <QueryFilter placeholder={t("searchPlaceholder")} />
          </div>
          <Select
            defaultValue={searchParams.get("status")?.toString() ?? "ALL"}
            onValueChange={handleFilterStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("filter.statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {statusesOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={searchParams.get("priority")?.toString() ?? "ALL"}
            onValueChange={handleFilterPriority}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("filter.priorityPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canManageBacklog && <BacklogCreateForm projectId={projectId} />}
        </div>
      </CardContent>
    </Card>
  );
}
