import ChatInput from "@/components/ChatInput";


export default function Chat() {
  return (
    <div className="flex flex-col h-full">
      <div className="relative">
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <ChatInput />
        </div>
      </div>
    </div>
  )
}
