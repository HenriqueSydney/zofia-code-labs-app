import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string; contextualTab: string; client: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug, client } = await params;
  redirect(`/clients/${client}/projects/${slug}/metrics/life-cycle`);
}
