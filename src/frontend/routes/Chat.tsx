import ChatInput from "@/frontend/components/ChatInput";
import Messages from "../components/Messages";
import { useParams } from "react-router";
import { useSidebar } from "../components/ui/sidebar";
import { useChat } from "@ai-sdk/react";
import { useLiveQuery } from "dexie-react-hooks";
import { idb } from "@/frontend/dexie/db";
import { useApiKeyStore } from "@/store/apiKeyManager";
import { createMessage } from "@/frontend/dexie/query";
import { useState, useEffect, useRef } from "react";

export default function Chat() {
  const sidebar = useSidebar();
  const { threadId } = useParams();
  const { getApiKey } = useApiKeyStore();
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const savedMessageIds = useRef(new Set<string>());

  useEffect(() => {
    if (!threadId) {
      setInitialMessages([]);
      setInitialMessagesLoaded(true);
      savedMessageIds.current.clear();
      return;
    }

    const loadInitialMessages = async () => {
      try {
        const messages = await idb.messages
          .where('threadId')
          .equals(threadId)
          .sortBy('createdAt');
        messages.forEach(msg => savedMessageIds.current.add(msg.id));

        setInitialMessages(messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          createdAt: msg.createdAt
        })));
        setInitialMessagesLoaded(true);
      } catch (error) {
        console.error('Error loading initial messages:', error);
        setInitialMessages([]);
        setInitialMessagesLoaded(true);
      }
    };

    setInitialMessagesLoaded(false);
    savedMessageIds.current.clear();
    loadInitialMessages();
  }, [threadId]);

  const storedMessages = useLiveQuery(
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
    id: threadId || "new-chat",
    initialMessages: initialMessagesLoaded ? initialMessages : [],
    body: {
      model: "GPT-4-1",
      provider: "openai",
      apiKey: getApiKey("openai"),
    },
    onFinish: async (message) => {
      if (!threadId) return;

      await createMessage(threadId, {
        id: message.id,
        role: 'assistant',
        content: message.content,
        parts: [{ type: 'text', text: message.content }],
        createdAt: message.createdAt || new Date(),
      });
      savedMessageIds.current.add(message.id);
    },
    onError: (error) => {
      console.error('Error in chat:', error);
    }
  });

  useEffect(() => {
    if (!threadId || !chatState.messages) return;

    const saveUserMessages = async () => {
      for (const message of chatState.messages) {
        if (message.role === 'user' && !savedMessageIds.current.has(message.id)) {
          try {
            await createMessage(threadId, {
              id: message.id,
              role: 'user',
              content: message.content,
              parts: [{ type: 'text', text: message.content }],
              createdAt: message.createdAt || new Date(),
            });
            savedMessageIds.current.add(message.id);
          } catch (error) {
            console.error('Error saving user message:', error);
          }
        }
      }
    };

    saveUserMessages();
  }, [chatState.messages, threadId]);

  return (
    <div className="flex flex-col h-screen relative">
      <div className="flex-1 overflow-y-auto pb-24">
        {threadId ? (
          <Messages
            threadId={threadId}
            streamingMessages={chatState.messages}
            storedMessages={storedMessages}
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
