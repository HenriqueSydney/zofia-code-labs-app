"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { Link } from "@/i18n/navigation";
import { date } from "@/lib/dayjs";
import { Tooltip } from "@/components/Tooltip";
import { FolderKanban, Loader2 } from "lucide-react";
import { EmptyState } from "./EmptyState";

type ProjectListType = Omit<ProjectWithDetails, "projectServices" | "proposal">;

interface IProjectList {
  projects: ProjectListType[];
  totalOfRegister: number; // Adicionado para controle de fim de lista
}

export function ProjectList({ projects, totalOfRegister }: IProjectList) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado para acumular os projetos conforme as páginas mudam na URL
  const [displayedProjects, setDisplayedProjects] =
    useState<ProjectListType[]>(projects);
  const observerTarget = useRef<HTMLDivElement>(null);

  const currentPage = Number(searchParams.get("page")) || 1;
  const ITEMS_PER_PAGE = 10;
  const hasMore = displayedProjects.length < totalOfRegister;

  // Sincroniza o array acumulado com os novos dados vindos do Server Component
  useEffect(() => {
    if (currentPage === 1) {
      // Se voltamos para a página 1 (ex: filtro resetado), reinicia a lista
      setDisplayedProjects(projects);
    } else {
      // Se for uma página nova, anexa os itens evitando duplicatas
      setDisplayedProjects((prev) => {
        const newItems = projects.filter(
          (p) => !prev.some((existing) => existing.id === p.id)
        );
        return [...prev, ...newItems];
      });
    }
  }, [projects, currentPage]);

  const loadMore = () => {
    if (!hasMore) return;

    const nextPage = currentPage + 1;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", nextPage.toString());
    params.set("numberPerPage", ITEMS_PER_PAGE.toString());

    // Atualiza a URL sem dar scroll para o topo
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, searchParams]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {totalOfRegister === 0 && (
          <EmptyState
            title="Nenhum projeto localizado"
            icon={FolderKanban}
            description="Nenhum projeto cadastrado até o momento. Cadastre o primeiro projeto e começe a ter controle sobre suas entregas"
          />
        )}
        {displayedProjects.map((project) => (
          <Link
            key={project.id}
            href={`/clients/${project.client.slug}/projects/${project.slug}/overview`}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      <strong>Cliente: </strong>
                      {project.client.companyName}
                    </p>
                    <Tooltip
                      description={project.description}
                      direction="bottom"
                    >
                      <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-6">
                        {project.description}
                      </p>
                    </Tooltip>
                  </div>
                  <div className="text-right space-y-2">
                    <StatusBadge status={project.status} />

                    <p className="text-xs text-muted-foreground min-w-30">
                      <span>
                        {project.startDate && "Iniciado: "}
                        {!project.startDate && "Criado: "}
                        {date(project.startDate ?? project.createdAt).format(
                          "DD/MM/YYYY"
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Sentinela para carregamento */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-6">
          <div className="flex items-center gap-2 text-primary animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">
              Carregando mais projetos...
            </span>
          </div>
        </div>
      )}

      {!hasMore && displayedProjects.length > 0 && (
        <div className="text-center text-muted-foreground py-6 text-sm border-t border-dashed">
          {totalOfRegister === 1 && <>Todos os projetos foram carregados.</>}
          {totalOfRegister > 1 && (
            <>
              Todos os
              <strong>{totalOfRegister}</strong>
              projetos foram carregados.
            </>
          )}
        </div>
      )}
    </div>
  );
}
