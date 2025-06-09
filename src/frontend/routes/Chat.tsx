import ChatInput from "@/components/ChatInput";
import { useSidebar } from "@/components/ui/sidebar";



export default function Chat() {
  const sidebar = useSidebar();

  return (
    <div className="flex flex-col h-full">
      <div className="relative">
        <div className={`fixed bottom-0 left-0 right-0 flex justify-center ${sidebar.open ? "md:left-64" : ""}`}>
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
