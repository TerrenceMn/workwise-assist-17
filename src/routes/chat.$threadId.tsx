import { createFileRoute } from "@tanstack/react-router";
import { ChatWorkbench } from "@/components/chat-workbench";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [{ title: "Chat · Wise" }],
  }),
  component: ChatWorkbench,
});
