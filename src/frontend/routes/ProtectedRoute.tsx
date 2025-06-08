import { useSession } from "@/lib/auth-client";
import { Navigate } from "react-router";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  if (!session?.user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 
