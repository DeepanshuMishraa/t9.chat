import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import TopMenu from "@/components/top-menu";
import { ConvexClientProvider } from "@/providers/convex-provider";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConvexClientProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full min-h-svh pb-32">
          <TopMenu />
          {children}
        </main>
      </SidebarProvider>
    </ConvexClientProvider>
  );
}
