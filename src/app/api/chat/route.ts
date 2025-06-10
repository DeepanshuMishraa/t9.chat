import { createOpenAI } from "@ai-sdk/openai"
import { createGroq } from "@ai-sdk/groq"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText, streamText } from "ai"

export const maxDuration = 60;

const getOpenAIResponse = async (message: string, messages: any[], modelName: string, apiKey: string) => {
  const openai = createOpenAI({ apiKey });
  const result = await streamText({
    model: openai(modelName),
    messages: messages,
    system: "Always return in markdown format.",
  })
  return result.toDataStreamResponse();
}
const getGroqResponse = async (message: string, messages: any[], modelName: string, apiKey: string) => {
  const groq = createGroq({ apiKey });
  const result = await streamText({
    model: groq(modelName),
    messages: messages,
    system: "Always return in markdown format.",
  })
  return result.toDataStreamResponse();
}

const getGoogleResponse = async (message: string, messages: any[], modelName: string, apiKey: string) => {
  const google = createGoogleGenerativeAI({ apiKey });
  const result = await streamText({
    model: google(modelName),
    messages: messages,
    system: "Always return in markdown format.",
  })
  return result.toDataStreamResponse();
}

export async function POST(req: Request) {
  try {
    const { message, messages, model, provider, apiKey } = await req.json();

    if (!apiKey) {
      return new Response("API key is required", { status: 400 });
    }

    let response;
    switch (provider) {
      case "openai":
        response = await getOpenAIResponse(message, messages, model, apiKey);
        break;
      case "groq":
        response = await getGroqResponse(message, messages, model, apiKey);
        break;
      case "google":
        response = await getGoogleResponse(message, messages, model, apiKey);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    return response;
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
