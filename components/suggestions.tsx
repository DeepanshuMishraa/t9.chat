"use client"

import { Suggestion } from "./ai-elements/suggestion"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"

export default function SuggestionsList() {
  const createThread = useMutation(api.query.CreateThread);
  const router = useRouter();

  const handleSuggestionClick = async (suggestion: string) => {
    try {
      const threadId = await createThread({ title: "New chat" });
      router.push(`/chat/${threadId}?q=${encodeURIComponent(suggestion)}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex flex-col items-start space-y-0 max-w-xl w-full">
        <Suggestion suggestion="what is the capital of france?" onClick={handleSuggestionClick} />
        <Suggestion suggestion="what is tcp and udp?" onClick={handleSuggestionClick} />
        <Suggestion suggestion="What is a geiger counter?" onClick={handleSuggestionClick} />
        <Suggestion suggestion="Is t3.chat better than Ai Feista by dhruv rathee?" onClick={handleSuggestionClick} />
      </div>
    </div>
  )
}
