import { useSession, signIn } from "@/lib/auth-client";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { RiGoogleFill, RiRobot2Fill } from "@remixicon/react";
import { useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  
  useEffect(() => {
    if (session?.user) {
      navigate("/chat");
    }
  }, [session, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google",
        fetchOptions: {
          onSuccess: () => {
            navigate("/chat");
          }
        }
      });
    } catch (error) {
      console.error("Failed to sign in:", error);
    }
  };

  if (session?.user) {
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/50 blur-2xl opacity-25" />
            <RiRobot2Fill className="relative w-24 h-24 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            t9.chat
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Experience the blazing fast multimodal ai chat
          </p>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 flex items-center gap-3"
            onClick={handleGoogleSignIn}
          >
            <RiGoogleFill className="w-5 h-5" />
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
