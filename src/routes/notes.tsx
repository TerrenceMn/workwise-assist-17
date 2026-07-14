import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ToolWorkbench } from "@/components/tool-workbench";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeNotes } from "@/lib/ai.functions";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer · Wise" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into a clean summary with decisions, action items, and deadlines.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const submit = async () => {
    if (notes.trim().length < 10) {
      toast.error("Paste your meeting notes to summarize.");
      return;
    }
    setLoading(true);
    try {
      const res = await summarizeNotes({ data: { notes } });
      setOutput(res.text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to summarize");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolWorkbench
      kind="notes"
      title="Meeting Notes Summarizer"
      description="Extract key points, decisions, action items, and deadlines from raw meeting notes."
      icon={<FileText className="h-5 w-5" />}
      loading={loading}
      output={output}
      onSubmit={submit}
      buildRun={() => ({
        title: notes.split("\n")[0]?.slice(0, 60) || "Meeting summary",
        input: { notes },
      })}
      form={
        <div className="space-y-2">
          <Label htmlFor="notes">Raw meeting notes</Label>
          <Textarea
            id="notes"
            placeholder="Paste your meeting transcript or bullet notes here…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={14}
            className="font-mono text-xs leading-relaxed"
          />
          <p className="text-[11px] text-muted-foreground">
            Longer notes yield a sharper summary.
          </p>
        </div>
      }
      submitLabel="Summarize"
    />
  );
}
