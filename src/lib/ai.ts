import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createGroq } from "@ai-sdk/groq"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { useApiKeyStore, type Provider } from "@/store/apiKeyManager"
import { idb } from "@/frontend/dexie/db"
import { updateThread } from "@/frontend/dexie/query"

const getApiKey = (provider: Provider): string => {
  const key = useApiKeyStore.getState().getApiKey(provider);
  return key || "";
}

const openai = createOpenAI({
  apiKey: getApiKey("openai"),
})

const groq = createGroq({
  apiKey: getApiKey("groq"),
})

export const google = createGoogleGenerativeAI({
  apiKey: getApiKey("google"),
})

const getOpenAIResponse = async (message: string, modelName: string) => {
  const { text } = await generateText({
    model: openai(modelName),
    prompt: message,
  })
  return text;
}

const getGroqResponse = async (message: string, modelName: string) => {
  const { text } = await generateText({
    model: groq(modelName),
    prompt: message,
  })
  return text;
}

const getGoogleResponse = async (message: string, modelName: string) => {
  const { text } = await generateText({
    model: google(modelName),
    prompt: message
  })
  return text;
}

export const GetResponse = async (provider: Provider, message: string, modelName: string) => {
  try {
    switch (provider) {
      case "openai":
        return getOpenAIResponse(message, modelName)
      case "groq":
        return getGroqResponse(message, modelName)
      case "google":
        return getGoogleResponse(message, modelName)
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while getting the response');
  }
}

export const getChatSummary = async (threadId: string) => {
  try {
    const messages = await idb.messages.where("threadId").equals(threadId).toArray();

    if (!messages || messages.length === 0) {
      await updateThread(threadId, "New Chat");
      return;
    }
    const formattedMessages = messages.map(msg => `${msg.role}: ${msg.content}`).join("\n");

    const systemPrompt = `Given this conversation, create a concise title (max 6 words) that captures its main topic:

${formattedMessages}

Title:`;

    // const { text } = await generateText({
    //   model: ,
    //   prompt: systemPrompt,
    // });

    const text= "new chat"

    const cleanTitle = text.replace(/["'\n]/g, '').trim();

    await updateThread(threadId, cleanTitle || "New Chat");
  } catch (error) {
    console.error("Error generating chat summary:", error);
    await updateThread(threadId, "New Chat");
  }
}
