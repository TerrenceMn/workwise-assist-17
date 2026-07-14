import { createFileRoute } from "@tanstack/react-router";
import { ChatWorkbench } from "@/components/chat-workbench";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat Assistant · Wise" },
      {
        name: "description",
        content:
          "Ask the Wise AI assistant anything about your workday. Threads are saved in your browser.",
      },
    ],
  }),
  component: ChatWorkbench,
});
