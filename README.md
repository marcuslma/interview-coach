# Interview Coach

<div align="center">

**Practice technical interviews with an AI interviewer — at your pace, in your browser.**

🎤 · 💬 · 🧠 · 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)

_Vibe coded · human reviewed_

</div>

---

## ✨ What is this?

**Interview Coach** is a **public web project**: a **chat-only** app for practicing **technical interviews** — pick a scenario, talk to an LLM-backed “interviewer,” and follow **phases**, **session history**, and a closing **rubric**, with optional **Markdown export** of the whole thread.

The codebase was built in a _vibe coding_ spirit (fast iteration, product and flow first) but went through **human review** for consistency, basic safety, and quality before landing in this public repository — ideas at speed, delivery with care.

**npm package:** `interview-coach`

---

## 🎯 Why use it?

|                            |                                                                        |
| :------------------------: | :--------------------------------------------------------------------- |
|    ✨ **Ten tracks**     | Languages, databases, Node, Nest, Next, system design, architecture, patterns, and more |
| 🗄️ **Persistent sessions** | SQLite stores your chats locally (or on the server you deploy to)      |
|       📄 **Export**        | Markdown with context + rubric for later review                        |
|    ⚡ **Low friction**     | Simple UI: tabs on the home page, chat in-session, history with delete |

---

## 🗂️ The ten tracks

On the home page, each tab is a **track** with ready-made scenarios (prompts live in code):

| Track                       | Focus                                                                                                               |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| ⚡ **JavaScript**           | Language fundamentals: execution order, semantics, closures, Big-O, optimizations _(default tab when you open the app)_ |
| 🛡️ **TypeScript**           | Types, narrowing, generics, utility types                                                                           |
| 🌱 **Node.js**              | Runtime, streams, modules, process, scaling patterns                                                                |
| 🐱 **NestJS**               | DI, modules, guards, pipes, interceptors                                                                            |
| 🚀 **Next.js**              | App Router, RSC, caching, route handlers, metadata                                                                  |
| 🍃 **MongoDB**              | Indexes, aggregation, replication, sharding, document modeling, transactions                                       |
| 🐘 **PostgreSQL**           | MVCC, isolation, indexes, EXPLAIN, locks, partitioning, jsonb                                                       |
| 🏗️ **System design**        | Distributed systems: trade-offs, capacity, APIs, data, reliability                                                  |
| 🧱 **Software architecture** | SOLID, Clean/Hexagonal, DDD tactical, boundaries, CQRS, evolution                                                  |
| 🧩 **Design patterns**      | GoF and enterprise patterns: creational/structural/behavioral, Repository, DI, etc.                                  |

**Quick URLs:** with no query string, the **JavaScript** tab is selected. Examples:

`?track=typescript` · `?track=nodejs` · `?track=nestjs` · `?track=nextjs` · `?track=mongodb` · `?track=postgresql` · `?track=system_design` · `?track=software_architecture` · `?track=design_patterns` · `?track=javascript`

---

## 🧱 How it works under the hood

- 📂 **Interview scenarios** live in `src/lib/prompts/*-seed.ts` (e.g. `system-design-seed.ts` exports sets like `SYSTEM_DESIGN_PROMPTS`). They are **not** loaded from the database — they ship with the codebase for versioning and predictability.
- 🗄️ **SQLite** (via **Drizzle ORM**) stores **sessions** and **messages**: your history and the model’s replies. On first run the app **creates these tables** if they are missing; you can still use `npm run db:push` to sync the schema explicitly after schema changes.
- 🔒 **LLM calls** run **server-side only** — API keys never reach the browser. Configure **OpenAI**, **Anthropic**, or **Google Gemini** via environment variables (`LLM_PROVIDER`).

**Stack:** **Next.js 16**, **React 19**, **Tailwind CSS 4**, **Drizzle** + **better-sqlite3**, **OpenAI** / **Anthropic** / **Google Generative AI** SDKs, **Zod** for validation, **react-markdown** + **remark-gfm** for rich rendering in chat and export.

**Locale:** The interviewer defaults to your browser’s `Accept-Language` / `navigator.language` and mirrors the language of your latest message when you switch. Optional body field `preferredLanguage` on session and chat APIs overrides the header.

**Shortcuts (home):** keys **1–9** select tracks **1–9** in order; **0** selects the **10th** track. **Session chat:** **Enter** sends, **Shift+Enter** newline, **Ctrl/Cmd+Enter** also sends.

---

## 📦 Prerequisites

- **Node.js 20+**
- An API key for your chosen provider (**OpenAI**, **Anthropic**, or **Google AI**), used only on the server — see [Configuration](#-configuration) and [.env.example](./.env.example).

---

## 🚀 Quick start

```bash
npm install
cp .env.example .env
# Edit .env: set LLM_PROVIDER and the matching API key (e.g. OPENAI_API_KEY)

npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and pick any track you like.

---

## ⚙️ Configuration

| Variable            | Required | Description |
| :------------------ | :------: | :---------- |
| `LLM_PROVIDER`      |    No    | `openai` (default), `anthropic`, or `google` |
| `OPENAI_API_KEY`    | With OpenAI | Server-only; never commit or expose to the client |
| `OPENAI_MODEL`      |    No    | Default: `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` | With Anthropic | Server-only |
| `ANTHROPIC_MODEL`   |    No    | Default: `claude-sonnet-4-20250514` |
| `GOOGLE_API_KEY`    | With Gemini | Server-only |
| `GOOGLE_MODEL`      |    No    | Default: `gemini-2.0-flash` |
| `DATABASE_PATH`     |    No    | SQLite path; default: `./data/interview-coach.db` |
| `SETTINGS_ENCRYPTION_KEY` | No | Passphrase used to encrypt API keys saved in the database from the **Settings** page. If unset, you can still override provider/model in Settings, but storing a key in SQLite returns HTTP 501 until this is set. |

**Settings UI:** open **`/settings`** in the running app to choose provider and model and optionally persist an API key (encrypted) in the local SQLite file. Values saved there override `LLM_PROVIDER` / model env vars for this instance.

---

## 💸 Costs and API usage

Each session performs at least **one** model call when it starts, plus **one per message** you send. Cost depends on the provider and model. Smaller models keep practice cheap. This project does **not** ship billing controls — set quotas in your cloud account.

---

## 🛠️ Scripts

| Command                           | What it does                  |
| :-------------------------------- | :---------------------------- |
| `npm run dev`                     | Development server            |
| `npm run build` / `npm run start` | Production build and start    |
| `npm run lint`                    | ESLint                        |
| `npm run db:push`                 | Apply SQLite schema (Drizzle) |
| `npm run db:studio`               | Drizzle Studio (inspect data) |
| `npm run db:clear`                | Delete all session rows (keeps schema) |
| `npm run db:reset`                | Delete the SQLite file(s) and run `db:push` (empty DB) |

---

## 🌐 Self-hosting

1. `npm run build`
2. `npm run start`
3. Provide the same environment variables on the host
4. Persist `./data` (or your `DATABASE_PATH`) if you want session history across deploys

---

## 📜 License

**MIT** — see [LICENSE](./LICENSE).

---

<div align="center">

**Happy practicing — and good luck in your interviews.**

Made with curiosity · reviewed with care

</div>
