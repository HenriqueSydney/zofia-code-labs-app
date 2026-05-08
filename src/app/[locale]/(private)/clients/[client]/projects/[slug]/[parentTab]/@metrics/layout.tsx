import { TabsContent } from "@/components/ui/tabs";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function ProjectLayout({ children }: LayoutProps) {
  return (
    <TabsContent value="metrics" className="space-y-6 mt-6">
      {children}
    </TabsContent>
  );
}
