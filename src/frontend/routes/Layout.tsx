import Appbar from "@/components/Appbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Appbar />
      {children}
    </div>
  )
}
