'use client';

import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageAvatar, MessageContent } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputToolbar, PromptInputTools, PromptInputSubmit, PromptInputModelSelect, PromptInputModelSelectTrigger, PromptInputModelSelectContent, PromptInputModelSelectItem, PromptInputModelSelectValue, PromptInputButton } from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import { Loader } from "@/components/ai-elements/loader";
import { useChat } from "@ai-sdk/react";
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { SidebarTrigger } from "../components/ui/sidebar";
import { idb } from "@/frontend/dexie/db";
import { createMessage, createThread } from "@/frontend/dexie/query";
import { useApiKeyStore } from "@/store/apiKeyManager";
import { AI_MODELS, getModelConfig, AIModel } from "@/lib/models";
import { useLiveQuery } from "dexie-react-hooks";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import { ChatBar } from "../components/ChatBar";
import { useSession } from "@/lib/auth-client";


export default function Chat() {
	const { threadId } = useParams();
	const navigate = useNavigate();
	const { getKey } = useApiKeyStore();
	const [input, setInput] = useState("");
	const [model, setModel] = useState<AIModel>(AI_MODELS[0]);
	const session = useSession();

	// Load stored messages from Dexie and convert to UIMessage format
	const storedMessages = useLiveQuery(
		async () => {
			if (!threadId) return undefined;
			const messages = await idb.messages
				.where("threadId")
				.equals(threadId)
				.sortBy("createdAt");
			
			console.log('Loaded stored messages:', messages); // Debug log
			
			return messages.map(msg => ({
				id: msg.id,
				role: msg.role as 'user' | 'assistant',
				parts: msg.parts && msg.parts.length > 0
					? msg.parts
					: [{ type: 'text' as const, text: msg.content || '' }],
			})) as any[];
		},
		[threadId],
		undefined
	);

	// Use the correct useChat hook pattern
	const { messages, sendMessage, status, setMessages } = useChat({
		onFinish: async (message: any) => {
			if (threadId && message.role === 'assistant') {
				console.log('Saving AI message:', message); // Debug log
				
				// Only save the AI response - user messages are handled by useChat properly
				await createMessage(threadId, {
					id: message.id,
					role: "assistant",
					content: message.parts?.[0]?.type === 'text' ? message.parts[0].text : '',
					parts: message.parts || [],
					createdAt: new Date(),
				});
			}
		},
	});

	// Save user messages when they appear in the messages array
	useEffect(() => {
		if (!threadId || !messages.length) return;

		const saveNewUserMessages = async () => {
			const userMessages = messages.filter(msg => msg.role === 'user');
			for (const message of userMessages) {
				const existing = await idb.messages.where('id').equals(message.id).first();
				if (!existing) {
					await createMessage(threadId, {
						id: message.id,
						role: "user",
						content: message.parts?.[0]?.type === 'text' ? message.parts[0].text : '',
						parts: message.parts || [],
						createdAt: new Date(),
					});
				}
			}
		};

		saveNewUserMessages();
	}, [messages, threadId]);

	// Initialize messages ONLY when threadId changes (not when storedMessages updates)
	const [lastThreadId, setLastThreadId] = useState<string | undefined>();
	
	useEffect(() => {
		if (threadId !== lastThreadId) {
			console.log('Thread changed, loading stored messages for:', threadId);
			setLastThreadId(threadId);
			
			if (threadId && storedMessages) {
				console.log('Setting stored messages:', storedMessages);
				setMessages(storedMessages);
			} else if (!threadId) {
				setMessages([]);
			}
		}
	}, [threadId, lastThreadId, storedMessages, setMessages]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;

		const modelConfig = getModelConfig(model);
		const apiKey = getKey(modelConfig.provider);
		if (!apiKey) {
			toast.error(`Please add your ${modelConfig.provider} API key in settings`);
			return;
		}

		let currentThreadId = threadId;

		// Create new thread if needed
		if (!threadId) {
			const newThread = await createThread(input);
			currentThreadId = newThread.id;
			navigate(`/chat/${newThread.id}`);
		}

		// User message will be handled by useChat hook

		// Send message using the correct pattern with headers
		sendMessage(
			{ text: input },
			{
				headers: {
					[modelConfig.headerKey]: apiKey,
				},
				body: {
					model: model,
				},
			}
		);

		setInput("");
	};

	const handleFileUpload = async (res: any) => {
		if (!res || !res[0]) return;

		const imageUrl = res[0].url;
		const modelConfig = getModelConfig(model);
		const apiKey = getKey(modelConfig.provider);
		if (!apiKey) {
			toast.error(`Please add your ${modelConfig.provider} API key in settings`);
			return;
		}

		try {
			const response = await fetch("/api/image-understanding", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: modelConfig.provider === "openai" ? "GPT-4o" : model,
					messages: [{
						role: "user",
						content: [
							{ type: "text", text: "What's in this image?" },
							{ type: "image", image: imageUrl }
						],
					}],
					provider: modelConfig.provider,
					apiKey,
				}),
			});

			if (!response.ok) throw new Error("Failed to analyze image");

			const data = await response.json();
			toast.success("Image analyzed successfully!");
			setInput(data.content || "");
		} catch (error) {
			console.error("Error analyzing image:", error);
			toast.error("Failed to analyze image");
		}
	};


	return (
		<div className="flex flex-col h-screen">
			<div className="md:hidden fixed top-4 left-4 z-50">
				<SidebarTrigger />
			</div>

			<Conversation className="flex-1">
				<ConversationContent>
					<div className="max-w-3xl mx-auto">
						{threadId && <ChatBar threadId={threadId} />}

						{messages.length === 0 && !threadId ? (
							<div className="flex items-center justify-center h-full text-muted-foreground">
								Start a new conversation
							</div>
						) : (
							<div className="space-y-4">
								{messages.map((message: any) => (
									<Message key={message.id} from={message.role}>
										<MessageAvatar
											src={message.role === "user" ? (session.data?.user?.image || "") : ""}
											name={message.role === "user" ? "You" : "AI"}
										/>
										<MessageContent>
											{message.parts ? (
												// Handle UI message format with parts array
												message.parts.map((part: any, i: number) => {
													switch (part.type) {
														case 'text':
															return message.role === "assistant" ? (
																<Response key={`${message.id}-${i}`}>{part.text}</Response>
															) : (
																<div key={`${message.id}-${i}`}>{part.text}</div>
															);
														default:
															return null;
													}
												})
											) : (
												// Handle legacy message format with content
												message.role === "assistant" ? (
													<Response>{message.content}</Response>
												) : (
													<div>{message.content}</div>
												)
											)}
										</MessageContent>
									</Message>
								))}
								{status === "streaming" && (
									<Message from="assistant">
										<MessageAvatar src="" name="AI" />
										<MessageContent>
											<Loader />
										</MessageContent>
									</Message>
								)}
							</div>
						)}
					</div>
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			<div className="border-t bg-background">
				<div className="max-w-3xl mx-auto p-4">
					<PromptInput onSubmit={handleSubmit}>
						<PromptInputTextarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="What would you like to know?"
							disabled={status === "streaming"}
						/>
						<PromptInputToolbar>
							<PromptInputTools>
								<PromptInputButton>
									<Paperclip className="h-4 w-4" />
								</PromptInputButton>

								<PromptInputModelSelect value={model} onValueChange={(value) => setModel(value as AIModel)}>
									<PromptInputModelSelectTrigger>
										<PromptInputModelSelectValue />
									</PromptInputModelSelectTrigger>
									<PromptInputModelSelectContent>
										<div className="space-y-2">
											<div>
												{AI_MODELS.map((modelName) => (
													<PromptInputModelSelectItem key={modelName} value={modelName}>
														{modelName}
													</PromptInputModelSelectItem>
												))}
											</div>
										</div>
									</PromptInputModelSelectContent>
								</PromptInputModelSelect>
							</PromptInputTools>

							<PromptInputSubmit disabled={!input.trim()} status={status} />
						</PromptInputToolbar>
					</PromptInput>
				</div>
			</div>
		</div>
	);
}
