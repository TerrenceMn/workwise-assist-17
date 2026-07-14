import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ToolWorkbench } from "@/components/tool-workbench";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { planTasks } from "@/lib/ai.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner · Wise" },
      {
        name: "description",
        content:
          "Prioritize your tasks and get a focused daily schedule with the Wise AI planner.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState("6");
  const [priorities, setPriorities] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const submit = async () => {
    if (tasks.trim().length < 3) {
      toast.error("List a few tasks to plan.");
      return;
    }
    setLoading(true);
    try {
      const res = await planTasks({
        data: { tasks, hoursAvailable: hours, priorities: priorities || undefined },
      });
      setOutput(res.text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolWorkbench
      kind="planner"
      title="AI Task Planner"
      description="Wise sorts your tasks with the Eisenhower matrix and builds a realistic daily schedule."
      icon={<ListChecks className="h-5 w-5" />}
      loading={loading}
      output={output}
      onSubmit={submit}
      buildRun={() => ({
        title: `Plan for ${hours}h day`,
        input: { tasks, hoursAvailable: hours, priorities },
      })}
      form={
        <>
          <div className="space-y-2">
            <Label htmlFor="tasks">Tasks</Label>
            <Textarea
              id="tasks"
              placeholder={"One task per line, e.g.\nPrep Q3 review deck\nReply to legal about MSA\nRun 1:1 with Sam"}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              rows={10}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours available</Label>
              <Input
                id="hours"
                type="number"
                min={1}
                max={12}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pri">Priorities (optional)</Label>
              <Input
                id="pri"
                placeholder="Ship the demo before EOD"
                value={priorities}
                onChange={(e) => setPriorities(e.target.value)}
              />
            </div>
          </div>
        </>
      }
      submitLabel="Plan my day"
    />
  );
}
