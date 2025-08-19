"use client"
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "./ai-elements/prompt-input";
import { Globe2Icon, PaperclipIcon } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { AI_MODELS, MODEL_CONFIGS, type AIModel } from "@/lib/models";
import { useApiKeyStore } from "@/store/apikeystore";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ChatInput() {
  const keys = useApiKeyStore((s) => s.keys);
  const [model, setModel] = useState<AIModel | undefined>(undefined);

  const availableModels = useMemo(() => {
    return AI_MODELS.filter((name) => {
      const provider = MODEL_CONFIGS[name].provider as keyof typeof keys;
      return Boolean(keys[provider]);
    });
  }, [keys]);

  useEffect(() => {
    if (!model || !availableModels.includes(model)) {
      setModel(availableModels[0]);
    }
  }, [availableModels, model]);
  const [text, setText] = useState("");
  const router = useRouter();
  const createThread = useMutation(api.query.CreateThread);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() || !model) return;

    // Create thread in Convex, then navigate and pass the initial message + model via search params
    const title = text.slice(0, 60) || "New chat";
    try {
      const threadId = (await createThread({ title })) as string;
      const q = encodeURIComponent(text);
      const m = encodeURIComponent(model);
      router.push(`/chat/${threadId}?q=${q}&m=${m}`);
      setText("");
    } catch (err) {
      console.error("Failed to create thread:", err);
    }
  };

  return (
    <div className="fixed left-0 right-0 md:left-[var(--sidebar-width)] bottom-0 z-40 px-4 py-3 md:py-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto w-full max-w-[min(42rem,calc(100vw-2rem))]">
        <PromptInput onSubmit={handleSubmit} className="relative rounded-2xl border border-border/40 bg-muted/20 shadow-lg">
          <PromptInputTextarea
            placeholder="Type your message here..."
            className="min-h-12 px-4 py-4 text-base placeholder:text-muted-foreground/70"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <PromptInputToolbar className="relative">
            <div className="flex items-center gap-1 pl-1">
              <PromptInputModelSelect value={model} onValueChange={(v) => setModel(v as AIModel)}>
                <PromptInputModelSelectTrigger className="h-8 rounded-lg px-2">
                  <PromptInputModelSelectValue placeholder={availableModels[0] ?? "Select model"} />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {availableModels.length > 0 ? (
                    availableModels.map((m) => (
                      <PromptInputModelSelectItem key={m} value={m}>{m}</PromptInputModelSelectItem>
                    ))
                  ) : (
                    <PromptInputModelSelectItem disabled value="none">No models available</PromptInputModelSelectItem>
                  )}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>

              <PromptInputButton className="h-8" variant="ghost" title="Search">
                <Globe2Icon className="size-4" />
                <span className="hidden sm:inline">Search</span>
              </PromptInputButton>

              <PromptInputButton className="h-8" variant="ghost" title="Attach file">
                <PaperclipIcon className="size-4" />
              </PromptInputButton>
            </div>

            <PromptInputSubmit
              className="absolute right-1 bottom-1 rounded-xl"
              disabled={!text.trim() || !model}
              status={'ready'}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  )
}
