import type { UIMessage } from "ai";

const isBrowser = typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

// ---- Chat threads ---------------------------------------------------------

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const THREADS_KEY = "wise.chat.threads.v1";

export function loadThreads(): ChatThread[] {
  return read<ChatThread[]>(THREADS_KEY, []).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
}

export function saveThreads(threads: ChatThread[]) {
  write(THREADS_KEY, threads);
}

export function upsertThread(thread: ChatThread) {
  const all = loadThreads();
  const idx = all.findIndex((t) => t.id === thread.id);
  if (idx >= 0) all[idx] = thread;
  else all.unshift(thread);
  saveThreads(all);
}

export function deleteThread(id: string) {
  saveThreads(loadThreads().filter((t) => t.id !== id));
}

export function newThreadId() {
  return `t_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

// ---- Tool output history --------------------------------------------------

export type ToolKind = "email" | "notes" | "planner" | "research";

export type ToolRun = {
  id: string;
  kind: ToolKind;
  title: string;
  input: Record<string, string>;
  output: string;
  createdAt: number;
};

const RUNS_KEY = "wise.tool.runs.v1";

export function loadRuns(kind?: ToolKind): ToolRun[] {
  const all = read<ToolRun[]>(RUNS_KEY, []);
  const list = kind ? all.filter((r) => r.kind === kind) : all;
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export function saveRun(run: ToolRun) {
  const all = read<ToolRun[]>(RUNS_KEY, []);
  all.unshift(run);
  // Keep last 50 per kind
  const byKind = new Map<ToolKind, ToolRun[]>();
  for (const r of all) {
    const list = byKind.get(r.kind) ?? [];
    list.push(r);
    byKind.set(r.kind, list);
  }
  const trimmed: ToolRun[] = [];
  for (const list of byKind.values()) trimmed.push(...list.slice(0, 50));
  trimmed.sort((a, b) => b.createdAt - a.createdAt);
  write(RUNS_KEY, trimmed);
}

export function deleteRun(id: string) {
  const all = read<ToolRun[]>(RUNS_KEY, []);
  write(
    RUNS_KEY,
    all.filter((r) => r.id !== id),
  );
}

export function newRunId() {
  return `r_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
