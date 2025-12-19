import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ projectId: string; contextualTab: string }>;
}

export default async function Page({ params }: PageProps) {
  const { projectId } = await params;
  redirect(`/projects/${projectId}/project/commercial/proposals`);
}
