import { useEffect, useState, type ReactNode } from "react";
import { Copy, Loader2, Sparkles, Trash2, History } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  deleteRun,
  loadRuns,
  newRunId,
  saveRun,
  type ToolKind,
  type ToolRun,
} from "@/lib/storage";

export type ToolWorkbenchProps = {
  kind: ToolKind;
  title: string;
  description: string;
  icon: ReactNode;
  form: ReactNode;
  submitLabel?: string;
  disabled?: boolean;
  loading: boolean;
  output: string | null;
  onSubmit: () => void | Promise<void>;
  buildRun?: () => { title: string; input: Record<string, string> } | null;
};

export function ToolWorkbench(props: ToolWorkbenchProps) {
  const {
    kind,
    title,
    description,
    icon,
    form,
    submitLabel = "Generate",
    disabled,
    loading,
    output,
    onSubmit,
    buildRun,
  } = props;

  const [runs, setRuns] = useState<ToolRun[]>([]);
  const [viewing, setViewing] = useState<string | null>(null);

  useEffect(() => {
    setRuns(loadRuns(kind));
  }, [kind]);

  // Persist a run when output arrives (only when it comes from fresh submit).
  useEffect(() => {
    if (!output || !buildRun) return;
    const meta = buildRun();
    if (!meta) return;
    const run: ToolRun = {
      id: newRunId(),
      kind,
      title: meta.title,
      input: meta.input,
      output,
      createdAt: Date.now(),
    };
    saveRun(run);
    setRuns(loadRuns(kind));
    setViewing(run.id);
    // We intentionally depend only on output to fire once per new result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output]);

  const displayed = viewing
    ? (runs.find((r) => r.id === viewing)?.output ?? output)
    : output;

  const copy = async () => {
    if (!displayed) return;
    await navigator.clipboard.writeText(displayed);
    toast.success("Copied to clipboard");
  };

  const remove = (id: string) => {
    deleteRun(id);
    setRuns(loadRuns(kind));
    if (viewing === id) setViewing(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow">
          {icon}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Card className="shadow-elev-1">
          <CardHeader>
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>
              Give Wise structured context for a sharper result.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {form}
            <Button
              onClick={() => {
                setViewing(null);
                onSubmit();
              }}
              disabled={disabled || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> {submitLabel}
                </>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground">
              AI-generated content may require human review.
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0 shadow-elev-1">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <div className="min-w-0">
              <CardTitle className="text-base">Result</CardTitle>
              <CardDescription>
                {loading
                  ? "Wise is drafting your output…"
                  : displayed
                    ? "Structured output ready to review."
                    : "Fill in the inputs and generate to see results here."}
              </CardDescription>
            </div>
            {displayed && !loading ? (
              <Button variant="outline" size="sm" onClick={copy}>
                <Copy className="mr-2 h-3.5 w-3.5" /> Copy
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
              </div>
            ) : displayed ? (
              <article className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-table:text-sm">
                <ReactMarkdown>{displayed}</ReactMarkdown>
              </article>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No output yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {runs.length > 0 && (
        <Card className="shadow-elev-1">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <History className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Recent runs</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {runs.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <ul className="divide-y">
                {runs.map((r) => (
                  <li
                    key={r.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2"
                  >
                    <button
                      type="button"
                      className="min-w-0 text-left"
                      onClick={() => setViewing(r.id)}
                    >
                      <div className="truncate text-sm font-medium">{r.title}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()}
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(r.id)}
                      aria-label="Delete run"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
