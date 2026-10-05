# resq reviewer notes

## Architecture

RESQ is an npm-workspaces monorepo containing an Express/MongoDB/TypeScript API in `server/` and a React/Vite client in `client/`. Server business logic is separated into `services/` and the deterministic assessment engine under `server/src/analyzers/`; controllers are intended to remain thin. The client is currently a landing page and shell, while the API and assessment engine are the implemented core.

## Conventions

- Use strict TypeScript settings. Both `client/tsconfig.json` and `server/tsconfig.json` enable `strict`, `forceConsistentCasingInFileNames`, and related safety checks; client code also rejects unused locals/parameters.
- Use `.js` extensions for relative server imports in ESM TypeScript, as shown in `server/src/ai/index.ts` and `server/src/analyzers/disasterAssessment.ts`.
- Keep HTTP handling thin: route/controller code should validate input, call services or analyzers, and return the standard `{ success, data }` or `{ success, message, error }` envelope documented in `README.md`.
- Keep assessment policy in `server/src/analyzers/assessmentConfig.ts`. Weights, thresholds, hazard indices, regex signals, resources, and actions should be changed there rather than embedded in `disasterAssessment.ts`.
- Preserve deterministic assessment behavior. `assessDisaster` is pure with respect to its inputs/config, clamps scores to `0–100`, rounds factor values, preserves insertion order during deduplication, and returns `engineVersion` and a factor breakdown (`server/src/analyzers/disasterAssessment.ts`).
- Use Zod at trust boundaries. AI responses are parsed through `aiAssessmentSchema` in `server/src/ai/types.ts`; API write paths are documented as Zod-validated in `README.md`.
- Client styling uses Tailwind classes backed by semantic CSS variables. Add colors through the semantic palette in `client/vite.config.ts` and `client/src/index.css`, not arbitrary one-off theme colors.
- Use the `@/*` client alias for imports under `client/src`, configured in `client/tsconfig.json` and `client/vite.config.ts`.
- Query defaults are centralized in the `QueryClient` in `client/src/main.tsx`; new query behavior should account for its 30-second stale time, one retry, and disabled focus refetching.

## Intentional non-standard choices

- AI is strictly advisory and must never determine severity or make the request fail. `server/src/ai/index.ts` converts missing configuration and provider errors into `{ available: false }`; the deterministic result remains authoritative.
- AI prompts intentionally expose only selected, length-capped fields (`server/src/ai/prompt.ts`, `server/src/ai/types.ts`), and provider output is schema-validated before use.
- Tailwind is configured inline in `client/vite.config.ts` rather than a standalone `tailwind.config.js`; do not flag the missing config file.
- Development can fall back to a bundled local MongoDB when configured MongoDB is unreachable, as documented in `README.md`; this behavior is disabled in production.
- The landing page contains static dashboard mock data in `client/src/main.tsx`; the client is explicitly not fully implemented yet.

## Watch out for

- Do not allow AI output to overwrite deterministic severity, score, or recommendations; `SYSTEM_PROMPT` explicitly treats the deterministic assessment as authoritative.
- Flag scoring changes that bypass `assessmentConfig.ts`, violate the 100-point ceiling, break monotonicity/threshold behavior, or omit breakdown/resource/action updates. Existing tests cover these invariants per `README.md`.
- Flag regex/config changes that accidentally reuse global or stateful regexes, since signal matching calls `.test()` repeatedly.
- Preserve incident lifecycle validation and append-only timeline/audit behavior; illegal transitions must be rejected server-side (`README.md`).
- Check authorization on every report/admin/resource mutation. Role must come from authenticated server state, never request bodies (`README.md`).
- Flag secrets, real credentials, unrestricted CORS, unsafe upload handling, or logging of report/AI-sensitive content. `server/src/app.ts` intentionally enables credentials and serves uploads with `nosniff`.
