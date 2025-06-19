import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import MarkdownRenderer from "../components/Markdown";
import { Button } from "../components/ui/button";
import { getMessages } from "../dexie/query";

export const SharedChat = () => {
	const { threadId } = useParams();
	const navigate = useNavigate();

	const { isLoading, isError, data } = useQuery({
		queryKey: ["shared-thread", threadId],
		queryFn: async () => {
			const messages = await getMessages(threadId as string);
			return messages;
		},
		enabled: !!threadId,
	});

	if (isLoading) {
		return (
			<div className="flex flex-col h-screen bg-background">
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center space-y-4">
						<Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
						<p className="text-muted-foreground">Loading conversation...</p>
					</div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex flex-col h-screen bg-background">
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center space-y-4">
						<AlertCircle className="w-12 h-12 mx-auto text-destructive" />
						<h2 className="text-xl font-semibold">
							Error Loading Conversation
						</h2>
						<p className="text-muted-foreground max-w-md">
							Sorry, we couldn't load this conversation. It may have been
							deleted or the link is invalid.
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex flex-col h-screen bg-background">
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center space-y-4">
						<MessageCircle className="w-12 h-12 mx-auto text-muted-foreground" />
						<h2 className="text-xl font-semibold">No Messages Found</h2>
						<p className="text-muted-foreground">
							This conversation appears to be empty.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen bg-background">
			<div className="border-b bg-card">
				<div className="max-w-4xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<Button
								variant="ghost"
								onClick={() => navigate("/chat")}
								className="text-muted-foreground hover:text-foreground"
							>
								<ArrowLeft className="w-4 h-4" />
								Back
							</Button>
							<MessageCircle className="w-5 h-5 text-muted-foreground" />
							<div>
								<h1 className="text-lg font-semibold">Shared Conversation</h1>
								<p className="text-sm text-muted-foreground">
									{data.length} message{data.length !== 1 ? "s" : ""}
								</p>
							</div>
						</div>
						<div className="text-sm text-muted-foreground">
							Thread ID: {threadId?.slice(0, 8)}...
						</div>
					</div>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-4xl mx-auto px-6 py-8">
					<div className="space-y-6">
						{data.map((message, index) => (
							<div
								key={message.id}
								className={cn(
									"flex",
									message.role === "user" ? "justify-end" : "justify-start",
								)}
							>
								<div
									className={cn(
										"max-w-[85%] md:max-w-[100%] lg:max-w-[100%] rounded-lg px-4 py-3",
										message.role === "user"
											? "bg-primary text-primary-foreground"
											: "bg-muted",
									)}
								>
									<div className="text-xs font-medium text-muted-foreground mb-2">
										{message.role === "user" ? "You" : "Assistant"}
									</div>
									<div className="prose prose-sm max-w-none dark:prose-invert">
										<MarkdownRenderer content={message.content || ""} />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="border-t bg-card">
				<div className="max-w-4xl mx-auto px-6 py-4">
					<div className="text-center">
						<p className="text-sm text-muted-foreground">
							This is a shared conversation. Messages are read-only.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
