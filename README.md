# Interview Coach

**npm package:** `interview-coach`

Open-source web app to practice **technical interviews** in **six tracks** (tabs on the home page):

1. **JavaScript fundamentals** (default) — language-only snippets: execution order, semantics, closures, Big-O, optimizations.
2. **System design** — architecture, trade-offs, capacity, APIs, data, reliability.
3. **Node.js** — runtime, streams, modules, process, scaling patterns.
4. **TypeScript** — types, narrowing, generics, utility types.
5. **NestJS** — DI, modules, guards, pipes, interceptors.
6. **Next.js** — App Router, RSC, caching, route handlers, metadata.

Experience: **chat-only** with an **LLM-backed interviewer**, structured **phases**, **session history** (with **delete**), and **Markdown export** with a final **rubric**.

Interview scenarios live in **`src/lib/prompts/*-seed.ts`** (e.g. **`system-design-seed.ts`** exports `SYSTEM_DESIGN_PROMPTS`) — they are **not** loaded from the database; SQLite only stores your sessions and messages.

## Prerequisites

- Node.js 20+
- An OpenAI API key (server-side only)

## Quick start

```bash
npm install
cp .env.example .env
# Edit .env and set OPENAI_API_KEY

npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The **JavaScript** tab is selected by default (no query string). Other tracks: `?track=system_design`, `?track=nodejs`, `?track=typescript`, `?track=nestjs`, `?track=nextjs`, or `?track=javascript` explicitly.

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key (never commit; never expose to the browser). |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini`. |
| `DATABASE_PATH` | No | SQLite file path; defaults to `./data/interview-coach.db`. |

## Costs and API usage

Each session performs at least one model call when it starts, plus one per message you send. Costs depend on OpenAI pricing and the model you choose. Prefer smaller models (e.g. `gpt-4o-mini`) for cheaper practice. This project does not ship billing controls; set quotas in your OpenAI account.

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm run start` — production
- `npm run lint` — ESLint
- `npm run db:push` — apply SQLite schema (Drizzle)
- `npm run db:studio` — Drizzle Studio (optional)

## Upgrading from older versions

If your SQLite DB still has a `mermaid_content` column on `sessions` (removed in current code), drop it once:

```bash
sqlite3 ./data/interview-coach.db "ALTER TABLE sessions DROP COLUMN mermaid_content;"
```

If you still use the older default file `sds-coach.db`, set `DATABASE_PATH` accordingly or copy/rename the file to `interview-coach.db`.

## Self-hosting

1. Build: `npm run build`
2. Run: `npm run start`
3. Provide env vars on the host (same as local).
4. Persist `./data` (or your `DATABASE_PATH`) if you care about session history across deploys.

## License

MIT — see [LICENSE](./LICENSE).
