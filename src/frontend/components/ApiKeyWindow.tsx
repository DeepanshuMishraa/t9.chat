import { useApiKeyStore } from "@/store/apiKeyManager";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function BYOK() {
	const { setApiKey } = useApiKeyStore();
	const [googleApiKey, setGoogleApiKey] = useState("");
	const [openAiApiKey, setOpenAiApiKey] = useState("");
	const [GroqApiKey, setGroqApiKey] = useState("");

	return (
		<div className="flex items-center justify-center h-[100svh]">
			<Card className="w-[500px] p-6 shadow-lg">
				<CardTitle>Add your api keys</CardTitle>
				<CardDescription>
					Bring your own api keys and start chatting with the ai models
				</CardDescription>
				<CardContent className="flex flex-col space-y-4">
					<div className="space-y-2">
						<Label>Google API Key</Label>
						<Input
							placeholder="Enter your Google API key"
							value={googleApiKey}
							onChange={(e) => setGoogleApiKey(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>OpenAI API Key</Label>
						<Input
							placeholder="Enter your OpenAI API key"
							value={openAiApiKey}
							onChange={(e) => setOpenAiApiKey(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Groq API Key</Label>
						<Input
							placeholder="Enter your Groq API key"
							value={GroqApiKey}
							onChange={(e) => setGroqApiKey(e.target.value)}
						/>
					</div>
				</CardContent>

				<CardFooter>
					<Button
						onClick={() => {
							setApiKey("google", googleApiKey);
							setApiKey("openai", openAiApiKey);
							setApiKey("groq", GroqApiKey);
							toast.success("API keys saved");
						}}
						className="cursor-pointer w-full"
					>
						Save API Keys
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
