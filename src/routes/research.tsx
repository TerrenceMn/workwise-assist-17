import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ToolWorkbench } from "@/components/tool-workbench";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { researchTopic } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant · Wise" },
      {
        name: "description",
        content:
          "Generate executive-ready briefings with insights, considerations, and next actions.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const submit = async () => {
    if (topic.trim().length < 3) {
      toast.error("Give Wise a research topic.");
      return;
    }
    setLoading(true);
    try {
      const res = await researchTopic({
        data: { topic, goal: goal || undefined },
      });
      setOutput(res.text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to research");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolWorkbench
      kind="research"
      title="AI Research Assistant"
      description="Get an executive-ready briefing with insights, risks, and next steps on any topic."
      icon={<Search className="h-5 w-5" />}
      loading={loading}
      output={output}
      onSubmit={submit}
      buildRun={() => ({
        title: topic.slice(0, 60) || "Research briefing",
        input: { topic, goal },
      })}
      form={
        <>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g. Impact of AI copilots on enterprise support teams"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">Goal or audience (optional)</Label>
            <Textarea
              id="goal"
              placeholder="Briefing for the CTO to decide whether to pilot in Q4"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
            />
          </div>
        </>
      }
      submitLabel="Research topic"
    />
  );
}
