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

interface IBacklogFilter {
  serviceId: string;
}

export function BacklogFilter({ serviceId }: IBacklogFilter) {
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
    { value: "ALL", label: "Todos as prioriades" },
    { value: "HIGH", label: "Alta" },
    { value: "MEDIUM", label: "Média" },
    { value: "LOW", label: "Baixa" },
  ];

  return (
    <Card>
      <CardContent className="p-3 flex items-center justify-center">
        <div className="w-full items-center justify-center grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <QueryFilter placeholder="Buscar no backlog..." />
          </div>
          <Select
            value={searchParams.get("priority")?.toString()}
            onValueChange={handleFilterPriority}
          >
            <SelectTrigger>
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <BacklogCreateForm serviceId={serviceId} />
        </div>
      </CardContent>
    </Card>
  );
}
