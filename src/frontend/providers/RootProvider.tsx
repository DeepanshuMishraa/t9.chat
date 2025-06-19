"use client";

import { ourFileRouter } from "@/app/api/uploadthing/core";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { Toaster } from "../components/ui/sonner";
import QueryProvider from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export default function RootProvider({
	children,
}: { children: React.ReactNode }) {
	return (
		<QueryProvider>
			<NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				{children}
				<Toaster richColors theme="system" />
			</ThemeProvider>
		</QueryProvider>
	);
}
