import { cn } from "@/lib/utils";
import { Check, ShareIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ThemeToggler } from "./toggler";
import { Button } from "./ui/button";

export const ChatBar = ({ threadId }: { threadId: string }) => {
	const [copied, setCopied] = useState(false);

	const handleShare = async () => {
		try {
			await navigator.clipboard.writeText(
				`${window.location.origin}/shared/${threadId}`,
			);
			setCopied(true);
			toast.success("Share link copied to clipboard!", {
				description: "You can now share this conversation with others.",
				duration: 3000,
			});
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			toast.error("Failed to copy link", {
				description: "Please try again or copy the URL manually.",
			});
		}
	};

	return (
		<div className="fixed top-4 right-4 z-50 mb-20">
			<div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-2">
				<div className="flex items-center gap-2">
					<ThemeToggler />

					<div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

					<Button
						onClick={handleShare}
						variant="ghost"
						size="sm"
						className={cn(
							"rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20",
							"focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
							copied &&
								"bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
						)}
					>
						{copied ? (
							<Check className="w-4 h-4" />
						) : (
							<ShareIcon className="w-4 h-4" />
						)}
						<span className="sr-only">
							{copied ? "Link copied!" : "Share conversation"}
						</span>
					</Button>
				</div>
			</div>
		</div>
	);
};
