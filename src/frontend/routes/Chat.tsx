import ChatInput from "@/frontend/components/ChatInput";
import Messages from "../components/Messages";
import { useParams } from "react-router";
import { useSidebar } from "../components/ui/sidebar";
import { useChat } from "@ai-sdk/react";
import { useLiveQuery } from "dexie-react-hooks";
import { idb } from "@/frontend/dexie/db";
import { useApiKeyStore } from "@/store/apiKeyManager";
import { createMessage } from "@/frontend/dexie/query";

export default function Chat() {
  const sidebar = useSidebar();
  const { threadId } = useParams();
  const { getApiKey } = useApiKeyStore();

  const existingMessages = useLiveQuery(
    async () => {
      if (!threadId) return [];
      return await idb.messages
        .where('threadId')
        .equals(threadId)
        .sortBy('createdAt');
    },
    [threadId],
    []
  );

  const chatState = useChat({
    api: "/api/chat",
    id: threadId,
    initialMessages: existingMessages?.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      createdAt: msg.createdAt
    })) || [],
    body: {
      model: "GPT-4-1",
      provider: "openai",
      apiKey: getApiKey("openai"),
    },
    onFinish: async (message) => {
      if (!threadId) return;

      // Save the assistant's response to Dexie
      await createMessage(threadId, {
        id: message.id,
        role: 'assistant',
        content: message.content,
        parts: [{ type: 'text', text: message.content }],
        createdAt: message.createdAt || new Date(),
      });
    },
    onError: (error) => {
      console.error('Error in chat:', error);
    }
  });

  return (
    <div className="flex flex-col h-screen relative">
      <div className="flex-1 overflow-y-auto pb-24">
        {threadId ? (
          <Messages
            threadId={threadId}
            streamingMessages={chatState.messages}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Start a new conversation
          </div>
        )}
      </div>
      <div className={`bottom-0 right-0 bg-background z-50 border-t transition-all duration-200 ${sidebar.open ? "left-64" : "left-0"}`}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <ChatInput chatState={chatState} />
        </div>
      </div>
    </div>
  );
}
