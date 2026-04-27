# NextFlow — LLM Workflow Builder

> A pixel-perfect visual LLM workflow builder inspired by [Krea.ai](https://krea.ai)'s Node Editor — built with Next.js 15, React Flow, and Google Gemini.

![NextFlow Builder](https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- 🎨 **Pixel-perfect UI** — dark theme matching Krea.ai's design language
- 🔀 **Visual DAG canvas** — drag, drop, connect nodes with React Flow
- 🤖 **Gemini AI** — real LLM execution with multimodal support
- ⚡ **Trigger.dev** — async task execution with retries
- 🗄️ **PostgreSQL** — persistent workflow history via Prisma + Neon
- 🔄 **Parallel execution** — independent branches run concurrently
- ↩️ **Undo / Redo** — full canvas history
- 📦 **Zero config** — runs in demo mode without any API keys

---


## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React Flow, Zustand, Tailwind CSS |
| Backend | Fastify 5, TypeScript, Zod |
| Database | PostgreSQL, Prisma, Neon |
| LLM | Google Gemini (`@google/genai`) |
| Task Queue | Trigger.dev |
| File Processing | Transloadit |
| Icons | Lucide React |
| Notifications | Sonner |


## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

> No API keys needed — app runs in demo mode out of the box.

---

## 🧩 Node Types

| Node | Description | Input | Output |
|---|---|---|---|
| **Text** | Prompt or content input | — | `text` |
| **Upload Image** | Image URL with live preview | — | `image` |
| **Upload Video** | Video URL with player preview | — | `video` |
| **Run Any LLM** | Gemini execution, multimodal | `system_prompt` `user_message` `images` | `text` |
| **Crop Image** | x / y / width / height % | `image` | `image` |
| **Extract Frame** | Timestamp in seconds | `video` | `image` |

---

## 🗺️ Sample Workflow
```
Branch A (Image)              Branch B (Video)
─────────────────             ─────────────────
Upload Image                  Upload Video
↓                             ↓
Crop Image                    Extract Frame
↓          ↘                  ↓
LLM Description   ──→    Final Marketing Post LLM
```

---

## 🔑 API Keys

| Service | Link | Free Tier |
|---|---|---|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) | ✅ |
| Neon PostgreSQL | [neon.tech](https://neon.tech) | ✅ |
| Trigger.dev | [trigger.dev](https://trigger.dev) | ✅ |
| Transloadit | [transloadit.com](https://transloadit.com) | ✅ trial |

---

```

---
