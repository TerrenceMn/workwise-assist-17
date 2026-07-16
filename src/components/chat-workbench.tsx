import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart, type UIMessage } from "ai";
import { useNavigate, useParams } from "@tanstack/react-router";
import { FileText, MessageSquare, Paperclip, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputButton,
  usePromptInputAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { WiseLogo } from "@/components/wise-logo";
import {
  deleteThread,
  loadThreads,
  newThreadId,
  upsertThread,
  type ChatThread,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = "image/*,application/pdf";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export function ChatWorkbench() {
  const params = useParams({ strict: false }) as { threadId?: string };
  const navigate = useNavigate();
  const activeId = params.threadId ?? null;

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let all = loadThreads();
    if (all.length === 0) {
      const t: ChatThread = {
        id: newThreadId(),
        title: "New chat",
        updatedAt: Date.now(),
        messages: [],
      };
      upsertThread(t);
      all = [t];
    }
    setThreads(all);
    setHydrated(true);
    if (!activeId) {
      navigate({ to: "/chat/$threadId", params: { threadId: all[0].id }, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [threads, activeId],
  );

  const handleNew = () => {
    const t: ChatThread = {
      id: newThreadId(),
      title: "New chat",
      updatedAt: Date.now(),
      messages: [],
    };
    upsertThread(t);
    setThreads([t, ...threads]);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  const handleDelete = (id: string) => {
    deleteThread(id);
    const remaining = threads.filter((t) => t.id !== id);
    setThreads(remaining);
    if (activeId === id) {
      if (remaining.length > 0) {
        navigate({ to: "/chat/$threadId", params: { threadId: remaining[0].id }, replace: true });
      } else {
        const t: ChatThread = {
          id: newThreadId(),
          title: "New chat",
          updatedAt: Date.now(),
          messages: [],
        };
        upsertThread(t);
        setThreads([t]);
        navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
      }
    }
  };

  if (!hydrated || !activeThread) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-sm text-muted-foreground">
        Loading chat…
      </div>
    );
  }

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden min-w-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex items-center justify-between border-b p-3">
          <h2 className="text-sm font-semibold">Conversations</h2>
          <Button size="sm" variant="ghost" onClick={handleNew}>
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <ul className="space-y-0.5 p-2">
            {threads.map((t) => (
              <li
                key={t.id}
                className={cn(
                  "group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1 rounded-md text-sm",
                  t.id === activeId
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/60",
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate({ to: "/chat/$threadId", params: { threadId: t.id } })
                  }
                  className="min-w-0 truncate px-2 py-2 text-left"
                >
                  {t.title}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  className="mr-1 rounded p-1.5 text-muted-foreground opacity-0 hover:bg-background hover:text-destructive group-hover:opacity-100"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <div className="border-t p-3 text-[11px] text-muted-foreground">
          Threads are saved in your browser only.
        </div>
      </aside>

      <ChatPane
        key={activeThread.id}
        thread={activeThread}
        onUpdateThread={(updated) => {
          setThreads((prev) => {
            const next = [updated, ...prev.filter((t) => t.id !== updated.id)];
            return next;
          });
          upsertThread(updated);
        }}
        onNew={handleNew}
      />
    </div>
  );
}

function ChatPane({
  thread,
  onUpdateThread,
  onNew,
}: {
  thread: ChatThread;
  onUpdateThread: (t: ChatThread) => void;
  onNew: () => void;
}) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport,
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Chat error");
    },
  });

  const [text, setText] = useState("");

  useEffect(() => {
    if (messages.length === 0) return;
    const firstUser = messages.find((m) => m.role === "user");
    const title = firstUser
      ? (textOf(firstUser).slice(0, 50) || "New chat")
      : thread.title;
    onUpdateThread({
      ...thread,
      title,
      messages: messages as UIMessage[],
      updatedAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, status]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmitMessage = (message: PromptInputMessage) => {
    const value = message.text.trim();
    const files = message.files ?? [];
    if ((!value && files.length === 0) || isLoading) return;
    setText("");
    void sendMessage({
      text: value || (files.length > 0 ? "Please review the attached file(s)." : ""),
      files,
    });
  };

  return (
    <section className="flex min-w-0 flex-col">
      <div className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex min-w-0 items-center gap-2">
          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{thread.title}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={onNew} className="md:hidden">
          <Plus className="mr-1 h-4 w-4" /> New
        </Button>
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <EmptyState onPick={(prompt) => sendMessage({ text: prompt })} />
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent>
                  <MessageFiles message={m} />
                  {m.role === "assistant" ? (
                    <MessageResponse>{textOf(m)}</MessageResponse>
                  ) : (
                    textOf(m) && <div className="whitespace-pre-wrap">{textOf(m)}</div>
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {error.message}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t bg-background/80 p-4 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput
            accept={ACCEPTED_TYPES}
            multiple
            maxFiles={MAX_FILES}
            maxFileSize={MAX_FILE_SIZE}
            onError={(e) => toast.error(e.message)}
            onSubmit={(msg, e) => {
              e.preventDefault();
              handleSubmitMessage(msg);
            }}
          >
            <AttachmentPreviews />
            <PromptInputTextarea
              placeholder="Ask Wise anything — attach images or PDFs for context…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <PromptInputFooter className="justify-between">
              <AttachmentTrigger />
              <PromptInputSubmit status={status} disabled={isLoading} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            AI-generated content may require human review. Attachments up to 10MB — images and PDFs.
          </p>
        </div>
      </div>
    </section>
  );
}

function AttachmentTrigger() {
  const attachments = usePromptInputAttachments();
  return (
    <PromptInputButton
      type="button"
      variant="ghost"
      onClick={() => attachments.openFileDialog()}
      aria-label="Attach files"
    >
      <Paperclip className="h-4 w-4" />
      <span className="hidden sm:inline">Attach</span>
    </PromptInputButton>
  );
}

function AttachmentPreviews() {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 border-b p-2">
      {attachments.files.map((f) => {
        const isImage = f.mediaType?.startsWith("image/");
        return (
          <div
            key={f.id}
            className="group relative flex items-center gap-2 rounded-md border bg-background p-1.5 pr-7 text-xs"
          >
            {isImage && f.url ? (
              <img
                src={f.url}
                alt={f.filename ?? "attachment"}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="max-w-[140px] truncate">{f.filename ?? "file"}</div>
            <button
              type="button"
              onClick={() => attachments.remove(f.id)}
              className="absolute right-1 top-1 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Remove attachment"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function MessageFiles({ message }: { message: UIMessage }) {
  const files = message.parts.filter(
    (p): p is FileUIPart => p.type === "file",
  );
  if (files.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {files.map((f, i) => {
        const isImage = f.mediaType?.startsWith("image/");
        if (isImage && f.url) {
          return (
            <img
              key={i}
              src={f.url}
              alt={f.filename ?? "attachment"}
              className="max-h-64 max-w-full rounded-md border"
            />
          );
        }
        return (
          <a
            key={i}
            href={f.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs hover:bg-muted"
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="max-w-[220px] truncate">{f.filename ?? "file"}</span>
          </a>
        );
      })}
    </div>
  );
}

function textOf(m: UIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

const SUGGESTIONS = [
  "Draft a follow-up to a prospect who's gone quiet for two weeks.",
  "Summarize this week's priorities into a Monday standup update.",
  "Give me 5 sharp questions to ask in a vendor evaluation call.",
  "Explain OKRs vs KPIs for a new manager in 4 bullets.",
];

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl py-10 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-brand shadow-glow">
        <WiseLogo className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
        How can Wise help you today?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ask about anything work-related, or attach an image or PDF for review.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-lg border bg-card p-3 text-left text-sm text-foreground transition hover:border-brand/50 hover:shadow-elev-1"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
