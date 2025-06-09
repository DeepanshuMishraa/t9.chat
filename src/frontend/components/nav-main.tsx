import {
  PlusCircle,
  Search,
  Library,
  Play,
  Grid2x2,
  Youtube,
  FileText,
  MessageSquarePlus
} from "lucide-react"
import { NavLink, useLocation } from "react-router"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarTrigger
} from "../components/ui/sidebar"
import { getThreads } from "../dexie/query"
import { useQuery } from "@tanstack/react-query"

export default function NavMain() {
  const location = useLocation()

  const { isLoading, data, isError } = useQuery({
    queryKey: ['threads'],
    queryFn: async () => {
      return await getThreads()
    },
    refetchInterval: 1000,
  });

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error getting threads</div>

  return (
    <>
      <div className="flex mt-6 px-4 items-center justify-between">
        <h1 className="text-xl font-bold">t9</h1>
        <SidebarTrigger className="w-10 h-10" />
      </div>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              data-active={location.pathname === "/chat/new"}
            >
              <NavLink to="/chat">
                <MessageSquarePlus className="stroke-[1.5px]" />
                <span>New chat</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              data-active={location.pathname === "/search"}
            >
              <a href="/search">
                <Search className="stroke-[1.5px]" />
                <span>Search chats</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              data-active={location.pathname === "/library"}
            >
              <a href="/library">
                <Library className="stroke-[1.5px]" />
                <span>Library</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>AI Models</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              data-active={location.pathname === "/chat/sora"}
            >
              <a href="/chat/sora">
                <Play className="stroke-[1.5px]" />
                <span>Sora</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              data-active={location.pathname === "/chat/gpts"}
            >
              <a href="/chat/gpts">
                <Grid2x2 className="stroke-[1.5px]" />
                <span>GPTs</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Tools</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              data-active={location.pathname === "/tools/youtube"}
            >
              <a href="/tools/youtube">
                <Youtube className="stroke-[1.5px]" />
                <span>YouTube Summarizer</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              data-active={location.pathname === "/tools/pdf"}
            >
              <a href="/tools/pdf">
                <FileText className="stroke-[1.5px]" />
                <span>PDF Summarizer</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
        <SidebarMenu>
          {data?.map((thread) => (
            <SidebarMenuItem key={thread.id}>
              <SidebarMenuButton
                asChild
                data-active={location.pathname === `/chat/${thread.id}`}
              >
                <NavLink to={`/chat/${thread.id}`}>
                  {thread.title}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
