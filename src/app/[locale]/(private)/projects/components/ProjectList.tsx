"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { Link } from "@/i18n/navigation";
import { date } from "@/lib/dayjs";
import { Tooltip } from "@/components/Tooltip";

type ProjectListType = Omit<ProjectWithDetails, "projectServices">;

interface IProjectList {
  projects: ProjectListType[];
}

export function ProjectList({ projects }: IProjectList) {
  const [displayedProjects, setDisplayedProjects] =
    useState<ProjectListType[]>(projects);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 10;

  const loadMoreProjects = (
    projectsList: ProjectListType[],
    currentPage: number
  ) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newItems = projectsList.slice(startIndex, endIndex);

    if (currentPage === 1) {
      setDisplayedProjects(newItems);
    } else {
      setDisplayedProjects((prev) => [...prev, ...newItems]);
    }

    setHasMore(endIndex < projectsList.length);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => {
            const nextPage = prev + 1;
            loadMoreProjects(projects, nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, projects]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {displayedProjects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}/project/overview`}
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

                    <p className="text-xs text-muted-foreground">
                      {date(project.startDate).format("DD/MM/YYYY")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-4">
          <div className="animate-pulse">Carregando mais projetos...</div>
        </div>
      )}

      {!hasMore && displayedProjects.length > 0 && (
        <div className="text-center text-muted-foreground py-4">
          Todos os projetos foram carregados
        </div>
      )}
    </>
  );
}
