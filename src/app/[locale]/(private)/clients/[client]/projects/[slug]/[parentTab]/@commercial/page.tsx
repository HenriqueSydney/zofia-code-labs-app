import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string; contextualTab: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/projects/${slug}/project/commercial/proposals`);
}
