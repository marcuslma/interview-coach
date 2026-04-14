# Contributing

Thanks for helping improve **Interview Coach** (`interview-coach` on npm).

## Development

1. Fork and clone the repository.
2. `npm install`
3. Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.
4. `npm run db:push`
5. `npm run dev`

Run `npm run lint` before opening a pull request.

## Pull requests

- Keep changes focused and describe the problem and the solution in the PR text.
- Avoid committing `.env`, local SQLite files, or secrets.
- If you add prompts, put them in the right seed file: `javascript-seed.ts`, **`system-design-seed.ts`** (exports `SYSTEM_DESIGN_PROMPTS`), `nodejs-seed.ts`, `typescript-seed.ts`, `nestjs-seed.ts`, or `nextjs-seed.ts`. Keep entries concise with realistic `evaluatorNotes` for the interviewer model. Prefer stable `id` values (they are stored in sessions as `prompt_id`).

## Security

- Never embed API keys in client-side code or in the repository.
- Report sensitive security issues privately to the maintainers if applicable.
