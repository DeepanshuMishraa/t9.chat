"use client"
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useApiKeyStore } from "@/store/apikeystore";


export default function ApiKeyDialog() {
  const keys = useApiKeyStore((s) => s.keys);
  const setKeys = useApiKeyStore((s) => s.setKeys);

  const hasKeys = useMemo(() => Boolean(keys.openai || keys.google || keys.groq || keys.openrouter), [keys]);

  const [openai, setOpenai] = useState("");
  const [google, setGoogle] = useState("");
  const [groq, setGroq] = useState("");
  const [openrouter, setOpenrouter] = useState("");

  useEffect(() => {
    setOpenai(keys.openai ?? "");
    setGoogle(keys.google ?? "");
    setGroq(keys.groq ?? "");
    setOpenrouter(keys.openrouter ?? "");
  }, [keys.openai, keys.google, keys.groq, keys.openrouter]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleSave = () => {
    const payload: Partial<typeof keys> = {};
    if (openai.trim()) payload.openai = openai.trim();
    if (google.trim()) payload.google = google.trim();
    if (groq.trim()) payload.groq = groq.trim();
    if (openrouter.trim()) payload.openrouter = openrouter.trim();

    setKeys(payload);
  };

  return (
    <Dialog open={!hasKeys}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => { if (!hasKeys) e.preventDefault(); }}
        onPointerDownOutside={(e) => { if (!hasKeys) e.preventDefault(); }}
        onInteractOutside={(e) => { if (!hasKeys) e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle>
            Enter your API keys
          </DialogTitle>
          <DialogDescription>
            Go to the respective provider's website to get your API keys
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>OpenAI</Label>
            <Input placeholder="sk-..." value={openai} onChange={(e) => setOpenai(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Google</Label>
            <Input placeholder="AIza-..." value={google} onChange={(e) => setGoogle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Groq</Label>
            <Input placeholder="gsk-..." value={groq} onChange={(e) => setGroq(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>OpenRouter</Label>
            <Input placeholder="or-..." value={openrouter} onChange={(e) => setOpenrouter(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
