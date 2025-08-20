import { getModelConfig, ModelConfig } from "@/lib/models";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {

  const { messages } = await req.json();
  const headersList = await headers();
  const modelConfig: ModelConfig = getModelConfig("Gemini 2.5 Pro");

  const apiKey = headersList.get(modelConfig.headerKey) as string;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: `Missing API key for ${modelConfig.provider}` }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const model = createGoogleGenerativeAI({ apiKey });

  const summary = await generateText({
    model: model("gemini-2.5-pro"),
    prompt: `
    You are a helpful assistant that summarizes the conversation between a user and an assistant.
    The user and assistant are having a conversation about a topic.
    The user is the one who is asking questions and the assistant is the one who is answering them.
    The conversation is stored in the messages array.
    Here is the conversation:
    ${messages.map((message: any) => `${message.role}: ${message.content}`).join("\n")}
    `,
    maxOutputTokens: 1000,
  })

  if (summary.text.length === 0) {
    return NextResponse.json({
      success: false,
      message: "Failed to generate summary",
    })
  }

  return NextResponse.json({
    success: true,
    summary: summary.text,
  })
}
