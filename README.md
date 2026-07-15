# Wise AI Workplace Assistant

A modern, responsive web application that helps professionals automate daily work tasks using AI. Built with [TanStack Start](https://tanstack.com/start), [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com), and the [Lovable AI Gateway](https://docs.lovable.dev/features/ai-gateway).

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Smart Email Generator** — Draft polished emails tuned to tone and audience.
- **Meeting Notes Summarizer** — Turn raw notes into decisions, action items, and deadlines.
- **AI Task Planner** — Prioritize your day and get a realistic, focused schedule.
- **AI Research Assistant** — Generate executive briefings with insights, risks, and next steps.
- **AI Chat Assistant** — Ask Wise anything about your work in a threaded, saved chat interface.

All outputs are powered by structured prompt engineering and include a clear disclaimer that AI-generated content may require human review.

## Tech Stack

- **Framework:** TanStack Start v1 (full-stack React with SSR/SSG and server functions)
- **Build Tool:** Vite 7
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Components:** shadcn/ui primitives
- **AI:** Lovable AI Gateway (OpenAI-compatible completions)
- **State & Storage:** localStorage for chat threads and recent tool outputs
- **Language:** TypeScript (strict mode)

## Project Structure

```text
src/
  components/        # Reusable UI components (sidebar, shell, tool/chat workbenches, logo)
  hooks/             # Custom React hooks
  lib/               # Utilities, prompts, storage, AI gateway, and server functions
  routes/            # TanStack file-based routes
  styles.css         # Global styles and design tokens
  router.tsx         # Router configuration
  start.ts           # App start configuration
  server.ts          # Server entry configuration
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 20+
- A Lovable AI Gateway API key (`LOVABLE_API_KEY`)

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env` file in the project root:

```env
LOVABLE_API_KEY=your_lovable_api_key_here
```

The Lovable API key is used server-side only; it is never exposed to the client.

### Development

```bash
bun dev
```

The app runs at `http://localhost:8080` by default.

### Build

```bash
bun run build
```

### Preview Production Build

```bash
bun run start
```

## Design System

The app uses a professional SaaS aesthetic with deep slate surfaces and emerald accents. All colors, gradients, and shadows are defined as semantic design tokens in `src/styles.css` so theming remains consistent across components.

Key tokens:

- Primary brand: `#10b981` (emerald)
- Background: deep slate palette
- Typography: clean sans-serif stack
- Elevation: layered shadows for cards, popovers, and dialogs

## Prompt Engineering

Each tool uses a structured prompt template in `src/lib/prompts.ts` to ensure professional, clear, and actionable AI outputs. Prompts include:

- Role and audience context
- Required output sections
- Tone guidance
- Formatting constraints

## Data Persistence

- **Chat threads:** Saved locally in the browser (`localStorage`) and restored on page load.
- **Recent tool outputs:** Saved locally so users can revisit past results.

No backend database is required for core functionality.

## Security Notes

- The `LOVABLE_API_KEY` is read only inside server functions and server routes; it never reaches the client.
- AI generation endpoints are public by design. Rate limiting and authentication are not implemented in this prototype; consider adding them before production deployment.

## Disclaimer

> AI-generated content may require human review. Wise is an assistant, not a replacement for professional judgment.

## License

MIT
