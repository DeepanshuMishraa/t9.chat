import { useSession, signIn } from "@/lib/auth-client";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RiGoogleFill } from "@remixicon/react";

export default function Home() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google"
      });
    } catch (error) {
      console.error("Failed to sign in:", error);
    }
  };

  if (session?.user) {
    navigate("/chat");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Dialog open defaultOpen>
        <DialogContent className="gap-6 p-8 max-w-[350px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <DialogTitle className="text-2xl font-semibold">
              Welcome to t9.chat
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Sign in to start chatting
            </DialogDescription>
          </div>
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-6"
          >
            <RiGoogleFill className="w-5 h-5" />
            Continue with Google
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
