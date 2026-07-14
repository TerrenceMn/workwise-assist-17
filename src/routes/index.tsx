import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Wise AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Automate daily work with Wise: email drafting, meeting summaries, task planning, research, and an AI chat assistant.",
      },
    ],
  }),
  component: Dashboard,
});

const features = [
  {
    to: "/email" as const,
    title: "Smart Email Generator",
    desc: "Draft polished emails tuned to tone and audience.",
    icon: Mail,
    tag: "Communication",
  },
  {
    to: "/notes" as const,
    title: "Meeting Notes Summarizer",
    desc: "Turn raw notes into decisions, action items, and deadlines.",
    icon: FileText,
    tag: "Meetings",
  },
  {
    to: "/planner" as const,
    title: "AI Task Planner",
    desc: "Prioritize your day and get a realistic focused schedule.",
    icon: ListChecks,
    tag: "Productivity",
  },
  {
    to: "/research" as const,
    title: "AI Research Assistant",
    desc: "Executive briefings with insights, risks, and next steps.",
    icon: Search,
    tag: "Research",
  },
  {
    to: "/chat" as const,
    title: "AI Chat Assistant",
    desc: "Ask Wise anything about your work — threads are saved locally.",
    icon: MessageSquare,
    tag: "Assistant",
  },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-10">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-brand p-8 text-white shadow-glow sm:p-12">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-2xl space-y-4">
          <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/15">
            <Sparkles className="mr-1.5 h-3 w-3" /> Powered by Lovable AI
          </Badge>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Automate the busywork.
            <br />
            Get more of the real work done.
          </h1>
          <p className="text-sm leading-relaxed text-white/85 sm:text-base">
            Wise is your AI workplace assistant — five focused tools with
            structured prompts so every output is clear, professional, and
            ready to send.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/email"
              className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-white/90"
            >
              Draft an email <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center justify-center rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Open chat
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Workspace tools</h2>
            <p className="text-sm text-muted-foreground">
              Pick a workflow to get started.
            </p>
          </div>
          <span className="hidden text-[11px] text-muted-foreground sm:block">
            AI-generated content may require human review.
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link key={f.to} to={f.to} className="group">
              <Card className="h-full transition hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-elev-2">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {f.tag}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {f.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-brand">
                    Open <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
