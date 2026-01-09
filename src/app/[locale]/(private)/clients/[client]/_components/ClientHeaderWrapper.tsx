"use client";

import { usePathname } from "next/navigation";

export function ClientHeaderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isProjectList =
    pathname.endsWith("/projects") || pathname.endsWith("/projects/");
  const isInsideProject = pathname.includes("/projects") && !isProjectList;

  if (isInsideProject) return null;

  return <>{children}</>;
}
