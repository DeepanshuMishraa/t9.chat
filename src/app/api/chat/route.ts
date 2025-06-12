import { createOpenAI } from "@ai-sdk/openai"
import { createGroq } from "@ai-sdk/groq"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"
import { createPartFromUri, createUserContent, GoogleGenAI, Modality } from "@google/genai";

export const maxDuration = 10000;

const getOpenAIResponse = async (messages: any[], modelName: string, apiKey: string) => {
  const openai = createOpenAI({ apiKey });
  const result = await streamText({
    model: openai(modelName),
    messages: messages,
    system: "Always return in markdown format.",
  })
  return result.toDataStreamResponse();
}
const getGroqResponse = async (messages: any[], modelName: string, apiKey: string) => {
  const groq = createGroq({ apiKey });
  const result = await streamText({
    model: groq(modelName),
    messages: messages,
    system: "Always return in markdown format.",
  })
  return result.toDataStreamResponse();
}

const getGoogleResponse = async (messages: any[], modelName: string, apiKey: string) => {
  const google = createGoogleGenerativeAI({ apiKey });
  const result = await streamText({
    model: google(modelName, {
      useSearchGrounding: true
    }),
    messages: messages,
    system: "Always return in markdown format.",
  })
  return result.toDataStreamResponse();
}

const generateImages = async (prompt: string, apiKey: string) => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-preview-image-generation",
    contents: prompt,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE]
    }
  });

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("No response from image generation API");
  }

  const candidate = response.candidates[0];
  if (!candidate.content || !candidate.content.parts) {
    throw new Error("Invalid response format from image generation API");
  }

  // First, look for image data (prioritize image over text)
  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      const imageData = part.inlineData.data;
      if (imageData) {
        return `data:image/png;base64,${imageData}`;
      }
    }
  }

  // If no image data found, look for text as fallback
  for (const part of candidate.content.parts) {
    if (part.text) {
      return part.text;
    }
  }

  throw new Error("No image data found in response");
}


const imageUnderstanding = async (file: File, apiKey: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey });
  const fileInput = await ai.files.upload({
    file: file,
    config: {
      mimeType: "image/png"
    },
  })


  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: createUserContent([
      createPartFromUri(fileInput.uri as string, fileInput.mimeType as string),
      prompt,
    ]),
  });
  return response.text;
}

export async function POST(req: Request) {
  try {
    const { messages, model, provider, apiKey, googleApiKey } = await req.json();

    if (!apiKey) {
      return new Response("API key is required", { status: 400 });
    }

    let response;
    let imageGenerationNeeded = false;
    let imagePrompt = "";

    // Check if the last user message requests image generation
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      const userMessage = messages[messages.length - 1].content.toLowerCase();
      if (userMessage.includes("image") || userMessage.includes("generate") || userMessage.includes("create") || userMessage.includes("draw")) {
        imageGenerationNeeded = true;
        imagePrompt = messages[messages.length - 1].content;
      }
    }

    if (imageGenerationNeeded) {
      try {
        const googleKey = googleApiKey || apiKey;
        const imageData = await generateImages(imagePrompt, googleKey);
        const imageResponse = `![Generated Image](${imageData})\n\n*Image generated for prompt: "${imagePrompt}"*`;

        // Return as plain text response instead of streaming
        return new Response(imageResponse, {
          headers: { 'Content-Type': 'text/plain' }
        });
      } catch (error) {
        console.error('Image generation failed:', error);
        const errorMessage = `I apologize, but I couldn't generate an image for your request: "${imagePrompt}". Please make sure you have a valid Google API key configured for image generation.`;

        return new Response(errorMessage, {
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }

    switch (provider) {
      case "openai":
        response = await getOpenAIResponse(messages, model, apiKey);
        break;
      case "groq":
        response = await getGroqResponse(messages, model, apiKey);
        break;
      case "google":
        response = await getGoogleResponse(messages, model, apiKey);
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
