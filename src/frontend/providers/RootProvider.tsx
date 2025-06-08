import { ThemeProvider } from "./theme-provider"

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </div>
  )
}
