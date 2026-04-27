markdown# NextFlow — LLM Workflow Builder

A pixel-perfect visual LLM workflow builder inspired by Krea.ai's Node Editor, built with Next.js, React Flow, and Google Gemini.

---

## Project Structure
nextflow/
├── backend/    # Fastify REST API — TypeScript, Prisma, Gemini, Trigger.dev
└── frontend/   # Next.js 15 — React Flow, Zustand, Tailwind CSS

---

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Add your GEMINI_API_KEY and DATABASE_URL to .env
npm run dev
```

Runs on `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Add NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

Runs on `http://localhost:3000`

> **No API keys required** — runs in demo mode out of the box.

---

## Environment Variables

### `backend/.env`

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL=             # Neon PostgreSQL — falls back to in-memory if empty
GEMINI_API_KEY=           # Google AI Studio — falls back to demo mode if empty
TRIGGER_SECRET_KEY=       # Trigger.dev — optional
TRANSLOADIT_KEY=          # Transloadit — optional
TRANSLOADIT_SECRET=       # Transloadit — optional
```

### `frontend/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Getting API Keys

| Service | URL 
|---|---|---|
| Google Gemini | https://aistudio.google.com 
| Neon (PostgreSQL) | https://neon.tech |
| Trigger.dev | https://trigger.dev 
| Transloadit | https://transloadit.com | 

---

## Node Types

| Node | Input | Output |
|---|---|---|
| Text Node | Manual textarea | `text` |
| Upload Image | Image URL | `image` |
| Upload Video | Video URL | `video` |
| Run Any LLM | `system_prompt`, `user_message`, `images` | `text` |
| Crop Image | `image`, x/y/w/h % | `image` |
| Extract Frame | `video`, timestamp (s) | `image` |

---

## Features

- React Flow canvas with dot-grid, pan, zoom, MiniMap
- Drag-and-drop nodes from sidebar
- Type-safe connections — prevents invalid node pairings
- DAG validation — no cycles allowed
- Animated edges with directional arrows
- Undo / Redo (`Ctrl+Z` / `Ctrl+Y`)
- Delete nodes (`Delete` / `Backspace`)
- Run All / Run Selected nodes
- Parallel execution of independent branches
- LLM output displayed inline on node
- Workflow run history with node-level breakdown
- Save / load workflows
- In-memory fallback when no database configured

---

## Sample Workflow (Pre-loaded)
Branch A                    Branch B
────────────────            ────────────────
Upload Image                Upload Video
↓                           ↓
Crop Image                  Extract Frame
↓         ↘                 ↓
LLM Description  ──→   Final Marketing Post LLM

---

## Deployment

| Service | Purpose | URL |
|---|---|---|
| Vercel | Frontend | vercel.com |
| Render | Backend | render.com |
| Neon | PostgreSQL | neon.tech |
