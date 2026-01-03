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
  projectId: string;
}

export function BacklogFilter({ projectId }: IBacklogFilter) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterStatus = (statusValue: string) => {
    const params = new URLSearchParams(searchParams);
    if (statusValue !== "all") {
      params.delete("status");
    } else {
      params.set("status", statusValue);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFilterPriority = (priorityValue: string) => {
    const params = new URLSearchParams(searchParams);
    if (priorityValue !== "all") {
      params.delete("priority");
    } else {
      params.set("priority", priorityValue);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const statusesOptions = [
    { label: "ALL", value: "Todos os Status" },
    { label: "TODO", value: "A Fazer" },
    { label: "IN_PROGRESS", value: "Em Andamento" },
    { label: "REVIEW", value: "Revisão" },
    { label: "DONE", value: "Concluído" },
  ];

  const priorityOptions = [
    { label: "ALL", value: "Todos as prioriades" },
    { label: "HIGH", value: "Alta" },
    { label: "MEDIUM", value: "Média" },
    { label: "LOW", value: "Baixa" },
  ];

  return (
    <Card>
      <CardContent className="p-3 flex items-center justify-center">
        <div className="w-full items-center justify-center grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="col-span-2">
            <QueryFilter placeholder="Buscar no backlog..." />
          </div>
          <Select
            defaultValue={searchParams.get("status")?.toString()}
            onValueChange={handleFilterStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
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
          <BacklogCreateForm
            projectId={projectId}
          />
        </div>
      </CardContent>
    </Card>
  );
}
