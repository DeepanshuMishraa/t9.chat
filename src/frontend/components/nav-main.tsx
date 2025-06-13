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
import { getChatSummary } from "@/lib/ai"
import { SearchChat } from "./SearchChats"

export default function NavMain() {
  const location = useLocation()
  const { isLoading, data, isError } = useQuery({
    queryKey: ['threads'],
    queryFn: async () => {
      return await getThreads()
    },
  });

  const chatSummary = useQuery({
    queryKey: ['chatSummary'],
    queryFn: async () => {
      return await getChatSummary(data?.map((thread) => thread.id).join(",") || "")
    },
  })
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
            <SearchChat
              threads={data || []}
            />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
        <SidebarMenu>
          {data?.length === 0 ? <div className="text-center p-4">No chats found</div> : data?.map((thread) => (
            <SidebarMenuItem key={thread.id}>
              <SidebarMenuButton
                asChild
                data-active={location.pathname === `/chat/${thread.id}`}
              >
                <NavLink to={`/chat/${thread.id}`}>
                  <span className="text-sm">{chatSummary.data?.find((summary) => summary.threadId === thread.id)?.content || thread.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
