import ChatInput from "./ChatInput";
import ApiKeyDialog from "./apiKeyDialog";
import SuggestionsList from "./suggestions";

export default function Welcome() {
  return (
    <>
      <ApiKeyDialog />
      <div className="flex flex-col items-center justify-center min-h-[75svh] gap-3 space-y-10 w-full pb-32">
        <h1 className="font-bold text-3xl">How can i help you?</h1>
        <SuggestionsList />
      </div>
      <ChatInput />
    </>
  )
}
