import { TabsContent } from "@/components/ui/tabs";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string; contextualTab: string }>;
}

export default async function ProjectLayout({ children, params }: LayoutProps) {
  return (
    <TabsContent value="metrics" className="space-y-6 mt-6">
      {children}
    </TabsContent>
  );
}
