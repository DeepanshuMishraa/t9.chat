
import * as React from "react"

import { NavUser } from "@/frontend/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "../components/ui/sidebar"
import NavMain from "../components/nav-main"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

