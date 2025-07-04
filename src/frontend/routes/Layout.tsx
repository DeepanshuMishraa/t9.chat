import { AppSidebar } from "@/frontend/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div>
			{children}
		</div>
	);
}

export function ChatLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="h-screen flex flex-col">{children}</SidebarInset>
		</SidebarProvider>
	);
}
