import { AdminSidebar } from "@/components/AdminSidebar";
import Footer from "@/components/Footer";
import { SidebarClientProvider } from "@/components/SidebarClientProvider";
import { SidebarHeader } from "@/components/AppHeader/SidebarHeader";
import { getTranslations } from "next-intl/server";
import { SidebarInsetClientProvider } from "@/components/SidebarInsetClientProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations();

  return (
    <SidebarClientProvider>
      <AdminSidebar />
      <SidebarInsetClientProvider>
        <SidebarHeader />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </SidebarInsetClientProvider>
    </SidebarClientProvider>
  );
}
