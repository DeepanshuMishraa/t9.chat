"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { AI_MODELS, MODEL_CONFIGS, type AIModel } from "@/lib/models";
import { useApiKeyStore } from "@/store/apikeystore";
// Removed Conversation wrapper to avoid nested scrollbars
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
import { useMutation } from "convex/react";
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

  const initialSentRef = useRef(false);
  useEffect(() => {
    // If we were navigated here with an initial message/model in the URL, send it once.
    const q = search.get("q");
    const m = search.get("m") as AIModel | null;
    const initialModel = m && AI_MODELS.includes(m as AIModel) ? (m as AIModel) : (model ?? availableModels[0]);
    if (q && q.trim() && !initialSentRef.current) {
      // Kick off the model call
      const chosen = initialModel ?? availableModels[0];
      const cfg = chosen ? MODEL_CONFIGS[chosen] : null;
      const key = cfg ? keys[cfg.provider] : undefined;
      const headers = cfg && key ? { [cfg.headerKey]: key } : undefined;
      sendMessage(
        { text: q },
        { body: { model: chosen }, headers } as any
      );
      // Persist the user message to Convex
      createMessage({ threadId: threadId as any, role: "user", content: q });
      initialSentRef.current = true;
      // Remove the search params from the URL to avoid resending on refresh
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
    // Persist the user message first (fire and forget)
    createMessage({ threadId: threadId as any, role: "user", content: text });
    const chosen = model ?? availableModels[0];
    const cfg = chosen ? MODEL_CONFIGS[chosen] : null;
    const key = cfg ? keys[cfg.provider] : undefined;
    const headers = cfg && key ? { [cfg.headerKey]: key } : undefined;
    // Then send to the model API with provider header
    sendMessage(
      { text },
      { body: { model: chosen }, headers } as any
    );
    setText("");
  };

  // Persist the latest assistant message to Convex when messages update
  const lastAssistant = useMemo(() => {
    const reversed = [...messages].reverse();
    return reversed.find((m) => m.role === "assistant");
  }, [messages]);
  const savedAssistantIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!lastAssistant) return;
    try {
      const content = lastAssistant.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("");
      if (content && !savedAssistantIds.current.has(lastAssistant.id)) {
        savedAssistantIds.current.add(lastAssistant.id);
        createMessage({ threadId: threadId as any, role: "assistant", content });
      }
    } catch (e) {
      console.error(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAssistant]);

  return (
    <>
      <div className="mx-auto w-full max-w-4xl p-4 md:p-6 pb-40">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[80%]"}>
                <Message from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, i) => (
                      part.type === 'text' ? (
                        <Response key={`${message.id}-${i}`}>{part.text}</Response>
                      ) : null
                    ))}
                  </MessageContent>
                </Message>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom-fixed input bar */}
      <div className="fixed left-0 right-0 md:left-[var(--sidebar-width)] bottom-0 z-40 px-4 py-3 md:py-4 pointer-events-none">
        <div className="pointer-events-auto mx-auto w-full max-w-[min(42rem,calc(100vw-2rem))]">
          <PromptInput onSubmit={handleSubmit} className="relative rounded-2xl border border-border/40 bg-muted/20 shadow-lg">
            <PromptInputTextarea onChange={(e) => setText(e.target.value)} value={text} className="min-h-12 px-4 py-4 text-base placeholder:text-muted-foreground/70" />
            <PromptInputToolbar className="relative">
              <PromptInputTools>
                <PromptInputModelSelect value={model} onValueChange={(v) => setModel(v as AIModel)}>
                  <PromptInputModelSelectTrigger className="h-8 rounded-lg px-2">
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
              <PromptInputSubmit disabled={!text} status={status} className="absolute right-1 bottom-1 rounded-xl" />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </>
  );
}
