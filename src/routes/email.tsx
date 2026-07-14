import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ToolWorkbench } from "@/components/tool-workbench";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator · Wise" },
      {
        name: "description",
        content:
          "Draft professional emails tuned to your tone and audience with the Wise AI email generator.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Concise", "Persuasive", "Apologetic", "Enthusiastic"];
const AUDIENCES = ["Colleague", "Manager", "Client", "New prospect", "Vendor", "Executive"];

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("Client");
  const [tone, setTone] = useState("Formal");
  const [keyPoints, setKeyPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const submit = async () => {
    if (!purpose.trim()) {
      toast.error("Describe the email purpose to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await generateEmail({
        data: { purpose, audience, tone, keyPoints: keyPoints || undefined },
      });
      setOutput(res.text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolWorkbench
      kind="email"
      title="Smart Email Generator"
      description="Draft a polished email in seconds — Wise adapts the voice to your audience and tone."
      icon={<Mail className="h-5 w-5" />}
      loading={loading}
      output={output}
      onSubmit={submit}
      buildRun={() => ({
        title: purpose.slice(0, 60) || "Email draft",
        input: { purpose, audience, tone, keyPoints },
      })}
      form={
        <>
          <div className="space-y-2">
            <Label htmlFor="purpose">Email purpose</Label>
            <Textarea
              id="purpose"
              placeholder="e.g. Follow up with the client after our Tuesday demo and confirm next steps."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">Key points (optional)</Label>
            <Input
              id="key"
              placeholder="Timeline, price, attachment reference…"
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
            />
          </div>
        </>
      }
      submitLabel="Draft email"
    />
  );
}
