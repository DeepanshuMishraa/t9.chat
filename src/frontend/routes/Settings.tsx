import { useSession } from "@/lib/auth-client";
import { useApiKeyStore, PROVIDERS } from "@/store/apiKeyManager";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { Eye, EyeOff, Key, User, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const PROVIDER_NAMES = {
  google: "Google",
  openai: "OpenAI",
  groq: "Groq"
} as const;

const PROVIDER_DESCRIPTIONS = {
  google: "For Gemini models and image generation",
  openai: "For GPT models and text generation",
  groq: "For fast inference with Llama models"
} as const;

export default function Settings() {
  const { data: session } = useSession();
  const navigate = useNavigate();
    const {
    apiKeys,
    setApiKey,
    removeApiKey,
    hasApiKey,
    clearAllApiKeys,
    error
  } = useApiKeyStore();

  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const toggleKeyVisibility = (provider: string) => {
    setRevealedKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const handleKeyChange = (provider: string, value: string) => {
    setTempKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const handleSaveKey = async (provider: string) => {
    const key = tempKeys[provider];
    if (!key?.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    setIsSaving(true);
    try {
      setApiKey(provider as any, key.trim());
      toast.success(`${PROVIDER_NAMES[provider as keyof typeof PROVIDER_NAMES]} API key saved`);
      setTempKeys(prev => {
        const { [provider]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      toast.error("Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = (provider: string) => {
    removeApiKey(provider as any);
    toast.success(`${PROVIDER_NAMES[provider as keyof typeof PROVIDER_NAMES]} API key removed`);
  };

  const handleClearAll = () => {
    clearAllApiKeys();
    toast.success("All API keys cleared");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-6  space-y-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback className="text-lg">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{session?.user?.name || "User"}</CardTitle>
                <CardDescription className="text-base">
                  {session?.user?.email || "No email provided"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">API Keys</h2>
              <p className="text-muted-foreground">
                Manage your API keys for different AI providers
              </p>
            </div>
            {Object.keys(apiKeys).length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          <Separator />

          <div className="grid gap-6">
            {PROVIDERS.map((provider) => {
              const hasKey = hasApiKey(provider);
              const isRevealed = revealedKeys[provider];
              const currentKey = apiKeys[provider];
              const tempKey = tempKeys[provider];

              return (
                <Card key={provider} className="border-l-4 border-l-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Key className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {PROVIDER_NAMES[provider]}
                          </CardTitle>
                          <CardDescription>
                            {PROVIDER_DESCRIPTIONS[provider]}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasKey && (
                          <div className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>Configured</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {hasKey ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm font-medium">Current API Key</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(provider)}
                            className="h-6 px-2"
                          >
                            {isRevealed ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Input
                            type={isRevealed ? "text" : "password"}
                            value={isRevealed ? currentKey : "••••••••••••••••••••••••••••••••"}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveKey(provider)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">API Key</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="password"
                            placeholder={`Enter your ${PROVIDER_NAMES[provider]} API key`}
                            value={tempKey || ""}
                            onChange={(e) => handleKeyChange(provider, e.target.value)}
                            className="font-mono text-sm"
                          />
                          <Button
                            onClick={() => handleSaveKey(provider)}
                            disabled={!tempKey?.trim() || isSaving}
                            size="sm"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive text-sm">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
