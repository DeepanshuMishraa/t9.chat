import { createMessage, createThread } from "@/frontend/dexie/query";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";
import type { Provider } from "@/store/apiKeyManager";
import {
	ArrowRight,
	Bot,
	Check,
	ChevronDown,
	Loader2,
	LucideSearch,
	Paperclip,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

import { UploadButton } from "@/lib/uploadthing";
import { useApiKeyStore } from "@/store/apiKeyManager";
import type { UseChatHelpers } from "@ai-sdk/react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface ChatInputProps {
	chatState: UseChatHelpers & {
		addToolResult: ({
			toolCallId,
			result,
		}: { toolCallId: string; result: any }) => void;
	};
}
const OPENAI_SVG = (
	<div>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="256"
			height="260"
			preserveAspectRatio="xMidYMid"
			viewBox="0 0 256 260"
			aria-label="o3-mini icon"
			className="dark:hidden block"
		>
			<title>OpenAI Icon Light</title>
			<path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.30c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
		</svg>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="256"
			height="260"
			preserveAspectRatio="xMidYMid"
			viewBox="0 0 256 260"
			aria-label="o3-mini icon"
			className="hidden dark:block"
		>
			<title>OpenAI Icon Dark</title>
			<path
				fill="#fff"
				d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.30c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
			/>
		</svg>
	</div>
);

export default function ChatInput({ chatState }: ChatInputProps) {
	const [selectedModel, setSelectedModel] = useState("GPT-4-1");
	const [imageGenerating, setImageGenerating] = useState(false);
	const [imageAnalyzing, setImageAnalyzing] = useState(false);
	const { threadId } = useParams();
	const navigate = useNavigate();
	const { getApiKey } = useApiKeyStore();
	const { textareaRef, adjustHeight } = useAutoResizeTextarea({
		minHeight: 72,
		maxHeight: 300,
	});

	const { input, handleInputChange, isLoading, append, setInput } = chatState;

	const AI_MODELS = {
		openai: ["GPT-4-1", "GPT-4-1 Mini"],
		gemini: ["gemini-2.0-flash", "gemini-2.5-pro-preview-06-05"],
		groq: ["meta-llama/llama-guard-4-12b", "llama-3.3-70b-versatile"],
	};

	const getProviderAndModel = (
		modelName: string,
	): { provider: Provider; model: string } => {
		if (AI_MODELS.openai.includes(modelName)) {
			return { provider: "openai", model: modelName };
		}
		if (AI_MODELS.groq.includes(modelName)) {
			return { provider: "groq", model: modelName };
		}
		if (AI_MODELS.gemini.includes(modelName)) {
			return { provider: "google", model: modelName };
		}
		throw new Error(`Unknown model: ${modelName}`);
	};

	const MODEL_ICONS: Record<string, React.ReactNode> = {
		"GPT-4-1 Mini": OPENAI_SVG,
		"GPT-4-1": OPENAI_SVG,
		"gemini-2.0-flash": (
			<svg
				height="1em"
				style={{ flex: "none", lineHeight: "1" }}
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>Gemini</title>
				<defs>
					<linearGradient
						id="lobe-icons-gemini-fill"
						x1="0%"
						x2="68.73%"
						y1="100%"
						y2="30.395%"
					>
						<stop offset="0%" stopColor="#1C7DFF" />
						<stop offset="52.021%" stopColor="#1C69FF" />
						<stop offset="100%" stopColor="#F0DCD6" />
					</linearGradient>
				</defs>
				<path
					d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
					fill="url(#lobe-icons-gemini-fill)"
					fillRule="nonzero"
				/>
			</svg>
		),
		"gemini-2.5-pro-preview-06-05": (
			<svg
				height="1em"
				style={{ flex: "none", lineHeight: "1" }}
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>Gemini</title>
				<defs>
					<linearGradient
						id="lobe-icons-gemini-fill"
						x1="0%"
						x2="68.73%"
						y1="100%"
						y2="30.395%"
					>
						<stop offset="0%" stopColor="#1C7DFF" />
						<stop offset="52.021%" stopColor="#1C69FF" />
						<stop offset="100%" stopColor="#F0DCD6" />
					</linearGradient>
				</defs>
				<path
					d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
					fill="url(#lobe-icons-gemini-fill)"
					fillRule="nonzero"
				/>
			</svg>
		),
		"meta-llama/llama-guard-4-12b": (
			<div>
				<svg
					width="1em"
					height="1em"
					viewBox="0 0 400 400"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="dark:hidden block"
				>
					<title>Groq Icon Light</title>
					<path
						d="M400 200C400 310.457 310.457 400 200 400C89.5431 400 0 310.457 0 200C0 89.5431 89.5431 0 200 0C310.457 0 400 89.5431 400 200Z"
						fill="black"
					/>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M200.5 326C270.423 326 327 269.423 327 199.5C327 129.577 270.423 73 200.5 73C130.577 73 74 129.577 74 199.5C74 269.423 130.577 326 200.5 326ZM200.5 284C247.168 284 285 246.168 285 199.5C285 152.832 247.168 115 200.5 115C153.832 115 116 152.832 116 199.5C116 246.168 153.832 284 200.5 284Z"
						fill="white"
					/>
				</svg>
				<svg
					width="1em"
					height="1em"
					viewBox="0 0 400 400"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="hidden dark:block"
				>
					<title>Groq Icon Dark</title>
					<path
						d="M400 200C400 310.457 310.457 400 200 400C89.5431 400 0 310.457 0 200C0 89.5431 89.5431 0 200 0C310.457 0 400 89.5431 400 200Z"
						fill="white"
					/>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M200.5 326C270.423 326 327 269.423 327 199.5C327 129.577 270.423 73 200.5 73C130.577 73 74 129.577 74 199.5C74 269.423 130.577 326 200.5 326ZM200.5 284C247.168 284 285 246.168 285 199.5C285 152.832 247.168 115 200.5 115C153.832 115 116 152.832 116 199.5C116 246.168 153.832 284 200.5 284Z"
						fill="black"
					/>
				</svg>
			</div>
		),
		"llama-3.3-70b-versatile": (
			<div>
				<svg
					width="1em"
					height="1em"
					viewBox="0 0 400 400"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="dark:hidden block"
				>
					<title>Groq Icon Light</title>
					<path
						d="M400 200C400 310.457 310.457 400 200 400C89.5431 400 0 310.457 0 200C0 89.5431 89.5431 0 200 0C310.457 0 400 89.5431 400 200Z"
						fill="black"
					/>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M200.5 326C270.423 326 327 269.423 327 199.5C327 129.577 270.423 73 200.5 73C130.577 73 74 129.577 74 199.5C74 269.423 130.577 326 200.5 326ZM200.5 284C247.168 284 285 246.168 285 199.5C285 152.832 247.168 115 200.5 115C153.832 115 116 152.832 116 199.5C116 246.168 153.832 284 200.5 284Z"
						fill="white"
					/>
				</svg>
				<svg
					width="1em"
					height="1em"
					viewBox="0 0 400 400"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="hidden dark:block"
				>
					<title>Groq Icon Dark</title>
					<path
						d="M400 200C400 310.457 310.457 400 200 400C89.5431 400 0 310.457 0 200C0 89.5431 89.5431 0 200 0C310.457 0 400 89.5431 400 200Z"
						fill="white"
					/>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M200.5 326C270.423 326 327 269.423 327 199.5C327 129.577 270.423 73 200.5 73C130.577 73 74 129.577 74 199.5C74 269.423 130.577 326 200.5 326ZM200.5 284C247.168 284 285 246.168 285 199.5C285 152.832 247.168 115 200.5 115C153.832 115 116 152.832 116 199.5C116 246.168 153.832 284 200.5 284Z"
						fill="black"
					/>
				</svg>
			</div>
		),
	};

	const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			await handleMessageSubmit(e);
		}
	};

	const handleMessageSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!input.trim() || isLoading) return;

		const messageContent = input.trim();

		try {
			let currentThreadId = threadId;
			if (!threadId) {
				currentThreadId = crypto.randomUUID();
				await createThread(currentThreadId);
				navigate(`/chat/${currentThreadId}`);
			}

			const userMessage = {
				id: crypto.randomUUID(),
				role: "user" as const,
				content: messageContent,
				parts: [{ type: "text" as const, text: messageContent }],
				createdAt: new Date(),
			};

			// Check if this is an image generation request
			const isImageRequest =
				messageContent.toLowerCase().includes("image") ||
				messageContent.toLowerCase().includes("generate") ||
				messageContent.toLowerCase().includes("create") ||
				messageContent.toLowerCase().includes("draw");

			setInput("");

			if (isImageRequest) {
				// Handle image generation separately without streaming
				const googleApiKey = getApiKey("google");
				if (!googleApiKey) {
					alert("Please configure your Google API key in the settings first.");
					return;
				}

				await createMessage(currentThreadId!, userMessage);
				setImageGenerating(true);

				// Make direct API call for image generation
				try {
					const controller = new AbortController();
					const timeoutId = setTimeout(() => controller.abort(), 30000);

					const response = await fetch("/api/chat", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						signal: controller.signal,
						body: JSON.stringify({
							messages: [
								{ role: userMessage.role, content: userMessage.content },
							],
							model: selectedModel,
							provider: getProviderAndModel(selectedModel).provider,
							apiKey: getApiKey(getProviderAndModel(selectedModel).provider),
							googleApiKey: googleApiKey,
						}),
					});

					clearTimeout(timeoutId);

					if (!response.ok) {
						const errorText = await response.text();
						console.error("API error:", errorText);
						throw new Error(
							`Failed to generate image: ${response.status} ${errorText}`,
						);
					}

					// Get the plain text response
					const fullContent = await response.text();

					if (!fullContent || fullContent.trim().length === 0) {
						throw new Error("Empty response from image generation API");
					}

					const aiMessage = {
						id: crypto.randomUUID(),
						role: "assistant" as const,
						content: fullContent,
						parts: [{ type: "text" as const, text: fullContent }],
						createdAt: new Date(),
					};

					await createMessage(currentThreadId!, aiMessage);
					console.log("Image generation completed successfully");
				} catch (error) {
					console.error("Image generation failed:", error);

					let errorContent =
						"Sorry, I failed to generate the image. Please try again.";
					if (error instanceof Error) {
						if (error.name === "AbortError") {
							errorContent =
								"Image generation timed out. Please try again with a simpler prompt.";
						} else {
							errorContent = `Image generation failed: ${error.message}`;
						}
					}

					const errorMessage = {
						id: crypto.randomUUID(),
						role: "assistant" as const,
						content: errorContent,
						parts: [{ type: "text" as const, text: errorContent }],
						createdAt: new Date(),
					};
					await createMessage(currentThreadId!, errorMessage);
				} finally {
					console.log("Clearing image generation loading state");
					setImageGenerating(false);
				}
			} else {
				// Regular chat with streaming
				const providerForRequest = getProviderAndModel(selectedModel).provider;
				const apiKeyForRequest = getApiKey(providerForRequest);

				if (!apiKeyForRequest) {
					alert(
						`Please configure your ${getProviderAndModel(selectedModel).provider} API key in the settings first.`,
					);
					return;
				}

				await append(userMessage, {
					body: {
						model: selectedModel,
						provider: providerForRequest,
						apiKey: apiKeyForRequest,
						threadId: currentThreadId,
					},
				});
			}
		} catch (error) {
			console.error("Error in chat:", error);
		}
	};

	return (
		<div className="w-full ">
			<div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1.5">
				<div className="relative">
					<div className="relative flex flex-col">
						<div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
							<Textarea
								id="ai-input-15"
								value={input}
								placeholder={"What can I do for you?"}
								className={cn(
									"w-full rounded-xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
									"min-h-[72px]",
								)}
								ref={textareaRef}
								onKeyDown={handleKeyDown}
								onChange={(e) => {
									handleInputChange(e);
									adjustHeight();
								}}
								disabled={isLoading || imageGenerating || imageAnalyzing}
							/>
						</div>

						<div className="h-14 bg-black/5 dark:bg-white/5 rounded-b-xl flex items-center">
							<div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
								<div className="flex items-center gap-2">
									<DropdownMenu>
										<DropdownMenuTrigger
											asChild
											disabled={isLoading || imageGenerating || imageAnalyzing}
										>
											<Button
												variant="ghost"
												className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md dark:text-white hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
											>
												<AnimatePresence mode="wait">
													<motion.div
														key={selectedModel}
														initial={{ opacity: 0, y: -5 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: 5 }}
														transition={{ duration: 0.15 }}
														className="flex items-center gap-1"
													>
														{MODEL_ICONS[selectedModel] || (
															<Bot className="w-4 h-4 opacity-50" />
														)}
														{selectedModel}
														<ChevronDown className="w-3 h-3 opacity-50" />
													</motion.div>
												</AnimatePresence>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											className={cn(
												"min-w-[10rem]",
												"border-black/10 dark:border-white/10",
												"bg-gradient-to-b from-white via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800",
											)}
										>
											{Object.entries(AI_MODELS).map(([provider, models]) => (
												<div key={provider}>
													<div className="px-2 py-1.5 text-xs font-medium text-black/50 dark:text-white/50 uppercase">
														{provider}
													</div>
													{models.map((model) => (
														<DropdownMenuItem
															key={model}
															onSelect={() => setSelectedModel(model)}
															className="flex items-center justify-between gap-2"
														>
															<div className="flex items-center gap-2">
																{MODEL_ICONS[model] || (
																	<Bot className="w-4 h-4 opacity-50" />
																)}
																<span>{model}</span>
															</div>
															{selectedModel === model && (
																<Check className="w-4 h-4 text-blue-500" />
															)}
														</DropdownMenuItem>
													))}
												</div>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
									<div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
									<UploadButton
										endpoint="imageUploader"
										content={{
											button({ ready, isUploading }) {
												return (
													<Paperclip
														className={cn(
															"w-4 h-4 text-black/70 dark:text-white/70",
															(isUploading || imageAnalyzing) && "animate-spin",
															!ready && "opacity-50",
														)}
													/>
												);
											},
											allowedContent: () => null,
										}}
										appearance={{
											container: "!p-0 !m-0",
											button: cn(
												"!flex !items-center !gap-1 !h-8 !px-2 !text-xs !rounded-md !border-0 !outline-none !ring-0 !shadow-none",
												"!bg-black/5 dark:!bg-white/5 hover:!bg-black/10 dark:hover:!bg-white/10",
												"focus-visible:!ring-1 focus-visible:!ring-offset-0 focus-visible:!ring-blue-500 !transition-colors !duration-200",
											),
											allowedContent: "!hidden",
										}}
										onClientUploadComplete={async (res) => {
											toast.success("Image uploaded successfully");
											if (res && res[0]) {
												const uploadedFile = res[0];
												setImageAnalyzing(true);
												try {
													const googleApiKey = getApiKey("google");
													if (!googleApiKey) {
														alert(
															"Please configure your Google API key in the settings first for image analysis.",
														);
														return;
													}
													const currentThreadId = threadId;
													const userMessage = {
														id: crypto.randomUUID(),
														role: "user" as const,
														content: `Here's the image, analyze it: ${uploadedFile.name}`,
														parts: [
															{
																type: "text" as const,
																text: `Here's the image, analyze it: ${uploadedFile.name}`,
															},
														],
														createdAt: new Date(),
													};

													await createMessage(currentThreadId!, userMessage);
													const response = await fetch(
														"/api/image-understanding",
														{
															method: "POST",
															headers: { "Content-Type": "application/json" },
															body: JSON.stringify({
																fileUrl: uploadedFile.url,
																prompt:
																	"Analyze this image and describe what you see in detail. Include any text, objects, people, activities, colors, and overall composition.",
																apiKey: googleApiKey,
															}),
														},
													);

													const result = await response.json();

													if (result.success && result.analysis) {
														const aiMessage = {
															id: crypto.randomUUID(),
															role: "assistant" as const,
															content: `## Image Analysis\n\n${result.analysis}`,
															parts: [
																{
																	type: "text" as const,
																	text: `## Image Analysis\n\n${result.analysis}`,
																},
															],
															createdAt: new Date(),
														};

														await createMessage(currentThreadId!, aiMessage);
													} else {
														throw new Error(
															result.error || "Failed to analyze image",
														);
													}
												} catch (error) {
													console.error("Image analysis failed:", error);

													const errorMessage = {
														id: crypto.randomUUID(),
														role: "assistant" as const,
														content: `Sorry, I couldn't analyze the uploaded image. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
														parts: [
															{
																type: "text" as const,
																text: `Sorry, I couldn't analyze the uploaded image. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
															},
														],
														createdAt: new Date(),
													};

													if (threadId) {
														await createMessage(threadId, errorMessage);
													}
												} finally {
													setImageAnalyzing(false);
												}
											}
										}}
										onUploadError={(error: Error) => {
											toast.error("Upload failed: " + error.message);
										}}
									/>
								</div>
								<button
									type="button"
									className={cn(
										"rounded-lg p-2 bg-black/5 dark:bg-white/5",
										"hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
										isLoading && "opacity-50 cursor-not-allowed",
									)}
									aria-label="Send message"
									disabled={
										!input.trim() ||
										isLoading ||
										imageGenerating ||
										imageAnalyzing
									}
									onClick={handleMessageSubmit}
								>
									{isLoading || imageGenerating || imageAnalyzing ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<ArrowRight
											className={cn(
												"w-4 h-4 dark:text-white transition-opacity duration-200",
												input.trim() ? "opacity-100" : "opacity-30",
											)}
										/>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
