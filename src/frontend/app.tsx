import BYOK from "@/frontend/components/ApiKeyWindow";
import { PROVIDERS, useApiKeyStore } from "@/store/apiKeyManager";
import { BrowserRouter, Route, Routes } from "react-router";
import Chat from "./routes/Chat";
import Home from "./routes/Home";
import Layout, { ChatLayout } from "./routes/Layout";
import NotFound from "./routes/NotFound";
import Settings from "./routes/Settings";
import { SharedChat } from "./routes/SharedChat";

export default function App() {
	const { hasApiKey } = useApiKeyStore();
	const hasAnyApiKey = PROVIDERS.some((provider) => hasApiKey(provider));
	return (
		<BrowserRouter>
			<Routes>
				<Route
					index
					path="/"
					element={
						<Layout>
							<Home />
						</Layout>
					}
				/>
				<Route
					path="/chat"
					element={
						hasAnyApiKey ? (
							<ChatLayout>
								<Chat />
							</ChatLayout>
						) : (
							<BYOK />
						)
					}
				/>
				<Route
					path="/chat/:threadId"
					element={
						hasAnyApiKey ? (
							<ChatLayout>
								<Chat />
							</ChatLayout>
						) : (
							<BYOK />
						)
					}
				/>
				<Route path="/shared/:threadId" element={<SharedChat />} />
				<Route path="*" element={<NotFound />} />
				<Route path="/settings" element={<Settings />} />
			</Routes>
		</BrowserRouter>
	);
}
