import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { MessageCircle, Search } from "lucide-react";
import { useState } from "react"
import { useNavigate } from "react-router";

export const SearchChat = ({ threads }: { threads: any[] }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (threadId: string) => {
    setOpen(false);
    navigate(`/chat/${threadId}`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search chats</span>
      </button>

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
