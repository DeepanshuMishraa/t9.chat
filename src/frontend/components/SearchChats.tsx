import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { MessageCircle, Search } from "lucide-react";
import { useState } from "react"
import { useNavigate } from "react-router";
import { useSidebar, SidebarMenuButton } from "./ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const SearchChat = ({ threads }: { threads: any[] }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleSelect = (threadId: string) => {
    setOpen(false);
    navigate(`/chat/${threadId}`);
  };

  const handleOpenSearch = () => {
    setOpen(true);
  };

  return (
    <>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              onClick={handleOpenSearch}
              className="w-full cursor-pointer"
            >
              <Search className="stroke-[1.5px]" />
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
            Search chats
          </TooltipContent>
        </Tooltip>
      ) : (
        <SidebarMenuButton
          onClick={handleOpenSearch}
          className="w-full cursor-pointer"
        >
          <Search className="stroke-[1.5px]" />
          <span>Search chats</span>
        </SidebarMenuButton>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search chats..." />
        <CommandList>
          <CommandEmpty>
            No chats found.
          </CommandEmpty>
          <CommandGroup heading="Recent Chats">
            {threads.map((thread) => (
              <CommandItem
                key={thread.id}
                onSelect={() => handleSelect(thread.id)}
                className="cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span>{thread.title || `Chat ${thread.id.slice(0, 8)}...`}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
