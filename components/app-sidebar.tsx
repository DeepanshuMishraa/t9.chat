"use client"

import Link from "next/link";
import { Sidebar, SidebarContent, SidebarFooter, SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LogInIcon, SearchIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";


export default function AppSidebar() {
  const sidebar = useSidebar();
  const session = authClient.useSession();
  const isLoading = session?.isPending;

  const threads = useQuery(api.query.getThreads);
  const createThread = useMutation(api.query.CreateThread);
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarContent className="py-6 px-4">
        <div className="flex flex-col gap-8 items-center">
          {sidebar.state == "expanded" && (
            <div className="flex items-center justify-start gap-4 w-full">
              <SidebarTrigger className="fade-out transition-all duration-300" />
              <Link href="/" prefetch className="text-2xl text-center font-bold text-pink-300/90 shadow-lg">T9.chat</Link>
            </div>
          )}
          <Button
            onClick={async () => {
              try {
                const id = (await createThread({ title: "New chat" })) as string;
                router.push(`/chat/${id}`);
              } catch (e) {
                console.error(e);
              }
            }}
            className="w-full py-6 px-5 shadow-lg shadow-primary-foreground text-md"
            size="lg"
          >
            New Chat
          </Button>
          <div className="relative">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input placeholder="Search for your chats" className="w-full pl-10" />
          </div>
        </div>

        {threads?.length === 0 ? (
          <div className="flex items-center justify-center w-full py-8 px-4">
            <p className="text-sm text-muted-foreground">No chats yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {threads?.map((thread) => {
              return (
                <Link href={`/chat/${thread._id}`} key={thread._id} className="w-full py-4 px-5 flex items-center gap-4 justify-start text-md hover:bg-primary/10 transition-all duration-300">
                  <div className="flex flex-col items-start justify-center gap-2 flex-1">
                    <p className="text-sm font-medium">{thread.title}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <SidebarFooter className="absolute bottom-0 left-0 right-0 pb-5">
          {isLoading ? (
            <div className="w-full py-8 px-4">
              <div className="flex items-center justify-center gap-2 w-full">
                <Skeleton className="w-6 h-6 rounded-full" />
                <div className="flex flex-col items-start justify-center gap-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          ) : session?.data ? (
            <Button variant="outline" size="lg" className="flex items-center justify-center gap-2 w-full py-8">
              <Image
                src={session.data.user.image || ""}
                alt={session.data.user.name || ""}
                width={24}
                height={24}
                className="rounded-full"
              />
              <div className="flex flex-col items-start justify-center">
                <p className="text-sm font-medium">{session.data.user.name}</p>
                <p className="text-xs text-muted-foreground">{session.data.user.email}</p>
              </div>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="py-6 px-4 flex items-center gap-4 justify-center text-md cursor-pointer" variant="ghost">
                <Link prefetch href="/auth">
                  <LogInIcon /> Login
                </Link>
              </Button>
            </>
          )}
        </SidebarFooter >
      </SidebarContent >
    </Sidebar >
  )
}
