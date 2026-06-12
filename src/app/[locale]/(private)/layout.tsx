import { AdminSidebar } from "@/components/AdminSidebar";
import { ClientSidebar } from "@/components/ClientSidebar";
import Footer from "@/components/Footer";
import { SidebarClientProvider } from "@/components/SidebarClientProvider";
import { SidebarHeader } from "@/components/AppHeader/SidebarHeader";
import { SidebarInsetClientProvider } from "@/components/SidebarInsetClientProvider";
import { auth } from "@/auth";
import { MemberRole } from "@/generated/prisma/enums";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isPortalOnly =
    session?.user.memberRole === MemberRole.TENANT_OBSERVER &&
    (!session.user.permissions || session.user.permissions.length === 0);

  const sidebarUser = session?.user
    ? { role: session.user.role, permissions: session.user.permissions }
    : null;

  return (
    <SidebarClientProvider>
      {isPortalOnly ? (
        <ClientSidebar
          clientMemberships={session?.user.clientMemberships ?? []}
        />
      ) : (
        <AdminSidebar user={sidebarUser} />
      )}
      <SidebarInsetClientProvider>
        <SidebarHeader />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </SidebarInsetClientProvider>
    </SidebarClientProvider>
  );
}
