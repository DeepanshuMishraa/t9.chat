import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createGroq } from "@ai-sdk/groq"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { useApiKeyStore, type Provider } from "@/store/apiKeyManager"

const getApiKey = (provider: Provider): string => {
  const key = useApiKeyStore.getState().getApiKey(provider);
  return key || "";
}

export const openai = createOpenAI({
  apiKey: getApiKey("openai"),
})

export const groq = createGroq({
  apiKey: getApiKey("groq"),
})

export const google = createGoogleGenerativeAI({
  apiKey: getApiKey("google"),
})

export const getOpenAIResponse = async (message: string, modelName: string) => {
  const { text } = await generateText({
    model: openai(modelName),
    prompt: message
  })
  return text;
}

export const getGroqResponse = async (message: string, modelName: string) => {
  const { text } = await generateText({
    model: groq(modelName),
    prompt: message
  })
  return text;
}

export const getGoogleResponse = async (message: string, modelName: string) => {
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
