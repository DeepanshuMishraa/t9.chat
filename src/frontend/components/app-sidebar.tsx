import type * as React from "react";

import { NavUser } from "@/frontend/components/nav-user";

import NavMain from "../components/nav-main";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarRail,
	SidebarTrigger,
} from "../components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border shadow-lg">
				<div className="flex items-center gap-2 px-4 py-4 min-h-[56px]">
					<SidebarTrigger className="mr-2" />
				</div>
				<SidebarContent className="flex-1 min-h-0">
					<NavMain />
				</SidebarContent>
				<SidebarFooter>
					<NavUser />
				</SidebarFooter>
			</div>
			<SidebarRail />
		</Sidebar>
	);
}
