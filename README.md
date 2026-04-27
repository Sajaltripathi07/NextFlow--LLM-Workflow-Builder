# NextFlow — LLM Workflow Builder

A pixel-perfect visual LLM workflow builder inspired by Krea.ai's Node Editor, built with Next.js, React Flow, and Google Gemini.

## Project Structure

```
nextflow/
├── backend/   # Fastify REST API (TypeScript, Prisma, Gemini)
└── frontend/  # Next.js 15 app (React Flow, Zustand, Tailwind, Clerk)
```

## Quick Start (No API Keys Required)

The app runs in full demo mode without any API keys — workflows execute with simulated responses.

### 1. Start the Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:3001`

### 2. Start the Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | API port (default: 3001) |
| `FRONTEND_URL` | No | CORS origin (default: http://localhost:3000) |
| `DATABASE_URL` | No | PostgreSQL connection string (Neon). Falls back to in-memory store if omitted. |
| `GEMINI_API_KEY` | No | Google AI Studio key. Falls back to demo mode if omitted. |
| `CLERK_SECRET_KEY` | No | Clerk backend key |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | Backend URL (default: http://localhost:3001) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | No | Clerk publishable key |
| `CLERK_SECRET_KEY` | No | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | `/sign-up` |

---

## Getting API Keys

| Service | URL | Purpose |
|---|---|---|
| Google Gemini | https://aistudio.google.com | LLM execution (free tier) |
| Clerk | https://clerk.com | Authentication |
| Neon | https://neon.tech | PostgreSQL database |

---

## Features

### Node Types (6)

| Node | Description | Handles |
|---|---|---|
| **Text Node** | Textarea input for prompts and content | Out: `text` |
| **Upload Image** | Image URL input with preview | Out: `image` |
| **Upload Video** | Video URL input with preview | Out: `video` |
| **Run Any LLM** | Gemini model execution with multimodal inputs | In: `system_prompt`, `user_message`, `images` / Out: `text` |
| **Crop Image** | Configurable x/y/w/h percentage crop | In: `image` / Out: `image` |
| **Extract Frame** | Extract frame at timestamp from video | In: `video` / Out: `image` |

### Canvas Features

- React Flow canvas with dot-grid background
- Drag-and-drop nodes from sidebar
- Type-safe connections (prevents invalid type pairings)
- DAG validation (no cycles allowed)
- Animated edges with directional arrows
- MiniMap (bottom-right)
- Controls (bottom-left)
- Undo / Redo (`Ctrl+Z` / `Ctrl+Y`)
- Delete selected nodes (`Delete` / `Backspace`)
- Pan, zoom, fit-view

### Execution

- **Run All** — executes full workflow DAG
- **Run Selected** — executes only selected nodes
- Parallel layer execution (independent branches run concurrently)
- LLM output displayed inline on the node
- Pulsing glow animation on running nodes

### Workflow History (Right Panel)

- Full run history with timestamps
- Per-run node execution breakdown
- Status badges (success / failed / running / queued)
- Duration tracking (ms)
- Expandable run cards with node-level inputs/outputs/errors

### Authentication

- Clerk integration (optional)
- Falls back to `demo-user` mode when Clerk is not configured
- Protected routes redirect to `/sign-in`

---

## Sample Workflow (Pre-loaded)

The canvas starts with a **Product Marketing Kit Generator** pre-wired:

```
Branch A (Image)          Branch B (Video)
────────────────          ────────────────
Upload Image              Upload Video
    ↓                         ↓
Crop Image              Extract Frame (50%)
    ↓    ↘                    ↓
LLM (Description)    ──→  Final LLM (Marketing Post)
```

---

## Architecture

### Backend

```
src/
├── app.ts              # Fastify app factory
├── index.ts            # Entry point
├── domain/
│   ├── execution.ts    # DAG execution engine + Gemini calls
│   ├── graph.ts        # Topological sort, cycle detection, input collection
│   ├── workflow-schema.ts  # Zod validation schemas
│   └── workflow-types.ts   # TypeScript domain types
├── lib/
│   ├── env.ts          # Typed environment config
│   └── prisma.ts       # Prisma client (with null fallback)
├── repositories/
│   └── workflow-repository.ts  # DB or in-memory storage
├── routes/
│   ├── health.ts
│   └── workflows.ts
└── services/
    └── workflow-service.ts
```

### Frontend

```
src/
├── app/
│   ├── layout.tsx      # Root layout with Clerk + Toaster
│   ├── page.tsx        # Main page (auth gate → builder)
│   ├── globals.css     # Dark theme design tokens
│   ├── sign-in/        # Clerk sign-in page
│   └── sign-up/        # Clerk sign-up page
├── components/builder/
│   ├── builder-layout.tsx   # 3-column shell
│   ├── canvas-shell.tsx     # React Flow canvas
│   ├── history-panel.tsx    # Right sidebar run history
│   ├── node-library.tsx     # Left sidebar node picker
│   ├── top-bar.tsx          # Header with save/run/undo
│   └── workflow-node.tsx    # All 6 node renderers
├── lib/
│   ├── api.ts               # Typed API client
│   └── workflow-graph.ts    # Node builders, edge factory, DAG utils
├── middleware.ts            # Clerk route protection
├── stores/
│   └── use-builder-store.ts # Zustand store (nodes, edges, runs, history)
└── types/
    └── workflow.ts          # Shared TypeScript types
```

---

## Deployment (Vercel)

1. Push repo to GitHub
2. Import frontend into Vercel
3. Set environment variables in Vercel dashboard
4. Deploy backend separately (Railway, Render, Fly.io) or as a Vercel serverless function

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 15 (App Router) |
| UI | Tailwind CSS 3, Lucide React |
| Canvas | React Flow (@xyflow/react) |
| State | Zustand |
| Auth | Clerk (optional) |
| Backend | Fastify 5 |
| Validation | Zod |
| Database | PostgreSQL via Prisma (Neon) |
| LLM | Google Gemini (via @google/genai) |
| Notifications | Sonner |
