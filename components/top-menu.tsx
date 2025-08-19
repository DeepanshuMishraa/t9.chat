"use client"
import { PlusIcon, SearchIcon, Settings2 } from "lucide-react";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";


export default function TopMenu() {
  const sidebar = useSidebar()
  return (
    <div className="flex flex-row items-center justify-between w-full px-4 m-3">
      <div className="flex items-center border bg-outline rounded-lg px-3 py-3 gap-3">
        {sidebar.state == "collapsed" && (
          <SidebarTrigger />
        )}
        <SearchIcon className="w-6 h-6" />
        <PlusIcon className="w-6 h-6" />
      </div>
      <div className="flex items-center gap-3 px-3 py-2 bg-outline rounded-lg border">
        <Button variant="ghost" size="icon"><Settings2 /></Button>
        <Button variant="ghost" size="icon"><ThemeToggle /></Button>
      </div>
    </div>
  )
}
