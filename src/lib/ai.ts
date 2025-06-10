import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { useApiKeyStore, type Provider } from "@/store/apiKeyManager"
import { idb } from "@/frontend/dexie/db"
import { updateThread } from "@/frontend/dexie/query"

const getApiKey = (provider: Provider): string => {
  const key = useApiKeyStore.getState().getApiKey(provider);
  return key || "";
}
export const google = createGoogleGenerativeAI({
  apiKey: getApiKey("google"),
})

interface ChatSummary {
  threadId: string;
  content: string;
}

export const getChatSummary = async (threadIds: string): Promise<ChatSummary[]> => {
  try {
    if (!threadIds) return [];

    const summaries: ChatSummary[] = [];
    const ids = threadIds.split(',');

    for (const threadId of ids) {
      const messages = await idb.messages.where("threadId").equals(threadId).toArray();

      if (!messages || messages.length === 0) {
        summaries.push({ threadId, content: "New Chat" });
        await updateThread(threadId, "New Chat");
        continue;
      }

      const formattedMessages = messages.map(msg => `${msg.role}: ${msg.content}`).join("\n");
      const systemPrompt = `Given this conversation, create a concise title (max 6 words) that captures its main topic:

${formattedMessages}

Title:`;

      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt: systemPrompt,
      });

      const cleanTitle = text.replace(/["'\n]/g, '').trim();
      const title = cleanTitle || "New Chat";

      summaries.push({ threadId, content: title });
      await updateThread(threadId, title);
    }

    return summaries;
  } catch (error) {
    console.error("Error generating chat summary:", error);
    return [];
  }
}
