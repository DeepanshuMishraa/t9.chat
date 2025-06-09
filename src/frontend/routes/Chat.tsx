import ChatInput from "@/frontend/components/ChatInput";
import Messages from "../components/Messages";
import { useParams } from "react-router";
import { useSidebar } from "../components/ui/sidebar";

export default function Chat() {
  const sidebar = useSidebar();
  const { threadId } = useParams();

  return (
    <div className="flex flex-col h-screen relative">
      <div className="flex-1 overflow-y-auto pb-24">
        {threadId ? <Messages threadId={threadId} /> : <div className="flex items-center justify-center h-full text-muted-foreground">Start a new conversation</div>}
      </div>
      <div className={`bottom-0 right-0 bg-background z-50 border-t transition-all duration-200 ${sidebar.open ? "left-64" : "left-0"
        }`}>
        <div className="max-w-3xl mx-auto  px-4 py-4">
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
