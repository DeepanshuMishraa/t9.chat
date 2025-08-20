"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { AI_MODELS, MODEL_CONFIGS, type AIModel } from "@/lib/models";
import { useApiKeyStore } from "@/store/apikeystore";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ThreadPage() {
  const params = useParams<{ threadId: string }>();
  const router = useRouter();
  const { threadId } = params;
  const search = useSearchParams();

  const keys = useApiKeyStore((s) => s.keys);
  const availableModels = useMemo(() => {
    return AI_MODELS.filter((name) => {
      const provider = MODEL_CONFIGS[name].provider;
      return Boolean(keys[provider]);
    });
  }, [keys]);

  const urlModel = (search.get("m") as AIModel | null);
  const initialModel = useMemo(() => {
    const candidate = urlModel && (AI_MODELS as readonly string[]).includes(urlModel) ? (urlModel as AIModel) : undefined;
    return candidate ?? availableModels[0];
  }, [urlModel, availableModels]);
  const [model, setModel] = useState<AIModel | undefined>(initialModel);
  useEffect(() => {
    if (!model || !availableModels.includes(model)) setModel(availableModels[0]);
  }, [availableModels, model]);

  const { messages, status, sendMessage } = useChat();

  const createMessage = useMutation(api.query.createMessages);
  const savedMessages = useQuery(api.query.getMessages, { threadId: threadId as any });

  const allMessages = useMemo(() => {
    if (!savedMessages) return messages;
    
    const savedMessageMap = new Map(savedMessages.map(msg => [msg.content, msg]));
    const combinedMessages = [...messages];
    
    savedMessages.forEach(savedMsg => {
      const exists = messages.some(msg => 
        msg.parts.some(part => part.type === 'text' && part.text === savedMsg.content)
      );
      if (!exists) {
        combinedMessages.unshift({
          id: savedMsg._id,
          role: savedMsg.role as any,
          parts: [{ type: 'text' as const, text: savedMsg.content }]
        });
      }
    });
    
    return combinedMessages.sort((a, b) => {
      const aTime = savedMessageMap.get(a.parts.find(p => p.type === 'text')?.text || '')?.createdAt || 0;
      const bTime = savedMessageMap.get(b.parts.find(p => p.type === 'text')?.text || '')?.createdAt || 0;
      return aTime - bTime;
    });
  }, [messages, savedMessages]);

  const initialSentRef = useRef(false);
  useEffect(() => {
    const q = search.get("q");
    const m = search.get("m") as AIModel | null;
    const initialModel = m && AI_MODELS.includes(m as AIModel) ? (m as AIModel) : (model ?? availableModels[0]);
    if (q && q.trim() && !initialSentRef.current) {
      const chosen = initialModel ?? availableModels[0];
      const cfg = chosen ? MODEL_CONFIGS[chosen] : null;
      const key = cfg ? keys[cfg.provider] : undefined;
      const headers = cfg && key ? { [cfg.headerKey]: key } : undefined;
      sendMessage(
        { text: q },
        { body: { model: chosen }, headers } as any
      );
      createMessage({ threadId: threadId as any, role: "user", content: q });
      initialSentRef.current = true;
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      url.searchParams.delete("m");
      window.history.replaceState({}, "", url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;
    createMessage({ threadId: threadId as any, role: "user", content: text });
    const chosen = model ?? availableModels[0];
    const cfg = chosen ? MODEL_CONFIGS[chosen] : null;
    const key = cfg ? keys[cfg.provider] : undefined;
    const headers = cfg && key ? { [cfg.headerKey]: key } : undefined;
    sendMessage(
      { text },
      { body: { model: chosen }, headers } as any
    );
    setText("");
  };

  const lastAssistant = useMemo(() => {
    const reversed = [...messages].reverse();
    return reversed.find((m) => m.role === "assistant");
  }, [messages]);
  
  const savedAssistantIds = useRef<Set<string>>(new Set());
  const lastSavedContent = useRef<string>("");
  
  useEffect(() => {
    if (!lastAssistant || status === "streaming") return;
    
    try {
      const content = lastAssistant.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("");
        
      if (content && content !== lastSavedContent.current && !savedAssistantIds.current.has(lastAssistant.id)) {
        savedAssistantIds.current.add(lastAssistant.id);
        lastSavedContent.current = content;
        createMessage({ threadId: threadId as any, role: "assistant", content });
      }
    } catch (e) {
      console.error(e);
    } 
  }, [lastAssistant, status, createMessage, threadId]);

  return (
    <div className="flex flex-col h-full">
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="mx-auto w-full max-w-4xl p-4 md:p-6">
          <div className="flex flex-col gap-4">
            {allMessages.map((message) => (
              <div 
                key={message.id} 
                className={message.role === "user" ? "ml-auto min-w-xl" : "mr-auto min-w-xl"}
              >
                <Message from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <Response key={`${message.id}-${i}`}>
                              {part.text}
                            </Response>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              </div>
            ))}
          </div>
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="flex-shrink-0 p-4 bg-background">
        <div className="mx-auto w-full max-w-2xl">
          <PromptInput onSubmit={handleSubmit} className="relative rounded-2xl border border-border bg-background/50 backdrop-blur-sm shadow-sm">
            <PromptInputTextarea 
              onChange={(e) => setText(e.target.value)} 
              value={text} 
              placeholder="Type your message here..."
              className="min-h-[80px] px-4 py-4 text-base placeholder:text-muted-foreground/60 resize-none border-0 bg-transparent focus:ring-0" 
            />
            <PromptInputToolbar className="flex items-center justify-between px-4 py-3 border-t border-border/50">
              <PromptInputTools className="flex items-center gap-2">
                <PromptInputModelSelect value={model} onValueChange={(v) => setModel(v as AIModel)}>
                  <PromptInputModelSelectTrigger className="h-9 rounded-lg px-3 text-sm bg-background/50 border border-border/50 hover:bg-background/80">
                    <PromptInputModelSelectValue />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {availableModels.map((m) => (
                      <PromptInputModelSelectItem key={m} value={m}>
                        {m}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </PromptInputTools>
              <PromptInputSubmit 
                disabled={!text.trim()} 
                status={status} 
                className="h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" 
              />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
