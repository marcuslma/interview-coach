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

|                            |                                                                                                |
| :------------------------: | :--------------------------------------------------------------------------------------------- |
|   ✨ **Eleven tracks**     | Languages, React, databases, Node, Nest, Next, system design, architecture, patterns, and more |
| 🔐 **BYOK, zero-backend**  | Your LLM API key is encrypted in your browser with your own passphrase — nothing is stored on our servers |
| 🗄️ **Local-first history** | Sessions, messages, and settings live in `localStorage`; no database required to deploy        |
|       📄 **Export**        | Download Markdown with context + rubric for later review                                       |
|    ⚡ **Low friction**     | Simple UI: tabs on the home page, chat in-session, history with delete                        |

---

## 🗂️ The eleven tracks

On the home page, each tab is a **track** with ready-made scenarios (prompts live in code):

| Track                        | Focus                                                                                                               |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| ⚡ **JavaScript**            | Language fundamentals: execution order, semantics, closures, Big-O, optimizations _(default tab)_                   |
| 🛡️ **TypeScript**            | Types, narrowing, generics, utility types                                                                           |
| ⚛️ **React**                 | Hooks rules + stale closures, React.memo trio, React 18 concurrent, forms with RHF, React Query, Redux Toolkit       |
| 🌱 **Node.js**               | Runtime, streams, modules, process, scaling patterns                                                                |
| 🐱 **NestJS**                | DI, modules, guards, pipes, interceptors                                                                            |
| 🚀 **Next.js**               | App Router, RSC, caching, route handlers, metadata                                                                  |
| 🍃 **MongoDB**               | Indexes, aggregation, replication, sharding, document modeling, transactions                                        |
| 🐘 **PostgreSQL**            | MVCC, isolation, indexes, EXPLAIN, locks, partitioning, jsonb                                                       |
| 🏗️ **System design**         | Distributed systems: trade-offs, capacity, APIs, data, reliability                                                  |
| 🧱 **Software architecture** | SOLID, Clean/Hexagonal, DDD tactical, boundaries, CQRS, evolution                                                   |
| 🧩 **Design patterns**       | GoF and enterprise patterns: creational/structural/behavioral, Repository, DI, etc.                                 |

**Quick URLs:** with no query string, the **JavaScript** tab is selected. Examples:

`?track=typescript` · `?track=react` · `?track=nodejs` · `?track=nestjs` · `?track=nextjs` · `?track=mongodb` · `?track=postgresql` · `?track=system_design` · `?track=software_architecture` · `?track=design_patterns` · `?track=javascript`

---

## 🧱 How it works under the hood

- 📂 **Interview scenarios** live in `src/lib/prompts/*-seed.ts` (e.g. `system-design-seed.ts` exports sets like `SYSTEM_DESIGN_PROMPTS`). They ship with the codebase for versioning and predictability.
- 🧠 **Sessions, messages, and settings** are stored in the **browser's `localStorage`** under a versioned schema. No backend database — you can deploy this to any static-friendly host that also runs Next.js route handlers (Vercel, Cloudflare, Render, your own VM).
- 🔐 **Your LLM API key** is encrypted in `localStorage` using a passphrase **you** choose (AES-256-GCM + PBKDF2-SHA256, 200k iterations, Web Crypto). It is decrypted into memory only after you "unlock" the vault, and you can lock it at any time.
- 📡 **LLM calls** go through a thin Next.js `/api/chat` proxy: the browser sends the decrypted key in the `x-llm-api-key` header per request; the server forwards it to **OpenAI**, **Anthropic**, or **Google Gemini** and returns the reply. The server does not persist the key and does not log the header. `Origin`/`Referer` is validated against the host to deter cross-site abuse.

**Stack:** **Next.js 16**, **React 19**, **Tailwind CSS 4**, **OpenAI** / **Anthropic** / **Google Generative AI** SDKs, **Zod** for validation, **Web Crypto** for client-side encryption, **react-markdown** + **remark-gfm** for rich rendering in chat and export.

**Locale:** The interviewer defaults to your browser’s `navigator.language` and mirrors the language of your latest message when you switch.

**Shortcuts (home):** keys **1–9** select tracks **1–9** in order; **0** selects the **10th** track; remaining tracks are reachable via the arrow keys or mouse. **Session chat:** **Enter** sends, **Shift+Enter** newline, **Ctrl/Cmd+Enter** also sends.

---

## 🔐 Security of your API key

Interview Coach is designed around **zero server-side storage of secrets**. Here is what happens in practice and what you should be aware of.

### Data flow

1. You paste your API key on `/settings` and pick a passphrase (minimum 8 characters).
2. The browser derives a 256-bit AES key from your passphrase using **PBKDF2-SHA256 with 200,000 iterations** and a random 128-bit salt.
3. The API key is encrypted with **AES-GCM-256** (random 96-bit IV and 128-bit auth tag per encryption) and the ciphertext is stored in `localStorage`.
4. The **passphrase is never stored** anywhere. It is used once per session to unlock the key into an in-memory reference on the active tab.
5. Each chat turn calls `/api/chat` with the key in the `x-llm-api-key` header (HTTPS only); the server forwards to the LLM provider and discards the key after the response.

### Threat model

| Risk                                      | Mitigation                                                                                                           |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| Stolen disk / browser profile at rest     | Only the ciphertext + salt are stored; useless without your passphrase.                                              |
| Compromised server or snooping proxy      | Server never persists the key; key only transits over HTTPS in a header, not in the URL or body.                     |
| XSS / malicious browser extension         | While unlocked, the decrypted key is reachable via JS. Strict **CSP** (`default-src 'self'`, no third-party scripts) is applied in production; **lock the vault** when you finish practicing. |
| Cross-site abuse of `/api/chat`           | `Origin` / `Referer` must match the host; missing/mismatched requests return `403`.                                  |
| Cross-tab drift after reset on another tab | The vault subscribes to storage changes and drops the in-memory key automatically.                                  |

### Forgot your passphrase?

There is **no recovery** — by design. The passphrase never leaves your device, so nobody (including us) can restore it.

1. On the Settings page, click **Forgot passphrase?** → **Reset and re-onboard**.
2. This wipes the encrypted API key and its salt from `localStorage`. **Your chat history stays** (it is not encrypted with the same passphrase).
3. Paste a new API key, pick a new passphrase, and you are back in.

### Best practices

- Use a unique API key for this app with a strict spending cap on the provider side.
- Lock the vault (top-right **Lock** button) when you step away from the device.
- Pick a **passphrase you can remember** — there is no password reset.

---

## 📦 Prerequisites

- **Node.js 20+**
- An API key for your chosen provider (**OpenAI**, **Anthropic**, or **Google AI**).

---

## 🚀 Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to **Settings**, pick a provider, paste your API key, choose a passphrase, and start practicing.

There is no `.env` to populate — everything is configured from the in-browser Settings page.

---

## 🛠️ Scripts

| Command                           | What it does                         |
| :-------------------------------- | :----------------------------------- |
| `npm run dev`                     | Development server                   |
| `npm run build` / `npm run start` | Production build and start           |
| `npm run lint`                    | ESLint                               |
| `npm test`                        | Vitest (browser-crypto round-trips)  |

---

## 💸 Costs and API usage

Each session performs at least **one** model call when it starts, plus **one per message** you send. Cost depends on the provider and model. Smaller models keep practice cheap. This project does **not** ship billing controls — set quotas in your provider account.

---

## 🌐 Self-hosting

1. `npm run build`
2. `npm run start`
3. Serve behind HTTPS; the CSP and HSTS headers in `next.config.ts` assume TLS in production.

No database, no disk mounts, no server-side API keys. Any Next.js-capable host works.

---

## 📜 License

**MIT** — see [LICENSE](./LICENSE).

---

<div align="center">

**Happy practicing — and good luck in your interviews.**

Made with curiosity · reviewed with care

</div>
