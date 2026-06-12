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
import { BacklogCreateForm } from "./BacklogCreateForm";
import { cn } from "@/utils/twMerge";
import { useTranslations } from "next-intl";

interface IBacklogFilter {
  serviceId: string;
  canEditBacklog: boolean;
}

export function BacklogFilter({ serviceId, canEditBacklog }: IBacklogFilter) {
  const t = useTranslations("settings.services.backlog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterPriority = (priorityValue: string) => {
    const params = new URLSearchParams(searchParams);
    if (priorityValue === "ALL") {
      params.delete("priority");
    } else {
      params.set("priority", priorityValue);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const priorityOptions = [
    { value: "ALL", label: t("filter.priority.all") },
    { value: "HIGH", label: t("filter.priority.high") },
    { value: "MEDIUM", label: t("priority.medium") },
    { value: "LOW", label: t("filter.priority.low") },
  ];

  return (
    <Card>
      <CardContent className="p-3 flex items-center justify-center">
        <div className="w-full items-center justify-center grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <QueryFilter placeholder={t("searchPlaceholder")} />
          </div>
          <div
            className={cn("lg:col-span-1", !canEditBacklog && "lg:col-span-2")}
          >
            <Select
              value={searchParams.get("priority")?.toString()}
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
          </div>
          {canEditBacklog && <BacklogCreateForm serviceId={serviceId} />}
        </div>
      </CardContent>
    </Card>
  );
}
