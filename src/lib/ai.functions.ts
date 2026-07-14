import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider, DEFAULT_CHAT_MODEL } from "./ai-gateway.server";
import {
  emailPrompt,
  notesPrompt,
  plannerPrompt,
  researchPrompt,
} from "./prompts";

async function runPrompt(prompt: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY on the server.");
  const gateway = createLovableAiGatewayProvider(key);
  try {
    const { text } = await generateText({
      model: gateway(DEFAULT_CHAT_MODEL),
      prompt,
    });
    return { text };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (/429/.test(message)) {
      throw new Error("Rate limit reached. Please try again in a moment.");
    }
    if (/402/.test(message)) {
      throw new Error(
        "AI credits exhausted. Add credits in your Lovable workspace to keep generating.",
      );
    }
    throw new Error(`AI request failed: ${message}`);
  }
}

const EmailInput = z.object({
  purpose: z.string().min(3),
  audience: z.string().min(1),
  tone: z.string().min(1),
  keyPoints: z.string().optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => runPrompt(emailPrompt(data)));

const NotesInput = z.object({ notes: z.string().min(10) });

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => NotesInput.parse(input))
  .handler(async ({ data }) => runPrompt(notesPrompt(data)));

const PlannerInput = z.object({
  tasks: z.string().min(3),
  hoursAvailable: z.string().min(1),
  priorities: z.string().optional(),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }) => runPrompt(plannerPrompt(data)));

const ResearchInput = z.object({
  topic: z.string().min(3),
  goal: z.string().optional(),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => runPrompt(researchPrompt(data)));
