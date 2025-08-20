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
        <main className="w-full h-screen flex flex-col">
          <TopMenu />
          <div className="flex-1 min-h-0">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </ConvexClientProvider>
  );
}
