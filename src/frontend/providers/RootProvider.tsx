'use client'

import { Toaster } from "../components/ui/sonner"
import QueryProvider from "./query-provider"
import { ThemeProvider } from "./theme-provider"

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
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
  )
}
