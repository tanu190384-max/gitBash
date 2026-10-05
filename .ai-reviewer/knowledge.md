# gitBash reviewer notes

## Architecture

This is a TypeScript RESQ disaster-assessment platform organized as an npm workspace: an Express/Mongoose server under `server/` and a Vite/React client under `client/`. The server exposes authenticated API routes, persists reports and users in MongoDB, computes deterministic assessments, and optionally annotates them with a provider-backed AI layer. Production can serve the built client from the server, while development runs both workspaces concurrently.

## Conventions

- Use strict TypeScript and ESM imports with explicit `.js` extensions; see `server/tsconfig.json` and imports throughout `server/src/`.
- Keep HTTP handlers thin: controllers use `asyncHandler`, validators, service/model calls, and standardized `ok`, `created`, or `paginated` responses; see `server/src/controllers/adminController.ts` and `alertController.ts`.
- Parse untrusted request data with Zod schemas before use, such as `userQuerySchema`, `updateUserSchema`, and `alertSchema` in `server/src/controllers/*.ts`.
- Throw `ApiError` for expected API failures and let centralized middleware handle them; controllers do not manually format error responses (`server/src/controllers/adminController.ts`, `server/src/controllers/alertController.ts`).
- Keep deterministic assessment behavior data-driven. Scoring weights, thresholds, keyword signals, resources, and actions belong in `server/src/analyzers/assessmentConfig.ts`; the algorithm belongs in `disasterAssessment.ts`.
- Assessment scores are bounded to 0–100, severity is classified through configured thresholds, and generated lists are deduplicated while preserving order (`server/src/analyzers/disasterAssessment.ts`).
- The deterministic assessment is authoritative; AI receives only an explicit, reduced `AiAssessmentRequest` and must validate model output through `aiAssessmentSchema` (`server/src/ai/types.ts`, `server/src/ai/prompt.ts`).
- Add AI vendors by implementing `AiProvider` and registering a factory in `server/src/ai/index.ts`; provider-specific SDK logic stays under `server/src/ai/providers/`.
- Use workspace scripts from the root for normal workflows: `npm run dev`, `npm run build`, `npm run typecheck`, `npm test`, and `npm run seed` (`package.json`).

## Intentional non-standard choices

- AI failures are deliberately non-fatal. `generateAiAssessment` returns `{ available: false, error }` rather than throwing so deterministic results remain usable (`server/src/ai/index.ts`).
- In non-production, database connection failure intentionally starts `mongodb-memory-server` with a persistent `server/.local-db` path; this fallback is explicitly forbidden in production (`server/src/config/db.ts`).
- The prompt asks the model for JSON only, but `extractJson` tolerates prose or code fences before Zod validation (`server/src/ai/providers/anthropicProvider.ts`).
- Development uses an intentionally weak fallback JWT secret and seeded credentials; production enforces a minimum 16-character `JWT_SECRET` (`server/src/config/env.ts`).

## Watch out for

- Do not let AI output replace, contradict, or alter deterministic severity and score; changes must preserve the authoritative boundary in `server/src/ai/prompt.ts` and `server/src/ai/index.ts`.
- New scoring signals must have stable IDs and account for resources/actions, normalization, and possible duplicate outputs (`server/src/analyzers/assessmentConfig.ts`).
- Avoid introducing unbounded free-text prompts or leaking unrelated report fields; `buildUserPrompt` length-caps descriptions and `AiAssessmentRequest` deliberately limits data (`server/src/ai/prompt.ts`, `server/src/ai/types.ts`).
- Preserve authorization invariants: administrators cannot demote/deactivate themselves or remove the last active administrator (`server/src/controllers/adminController.ts`).
- Preserve alert visibility and expiry semantics: user feeds exclude expired alerts, while admin broadcast management includes them (`server/src/controllers/alertController.ts`).
- Do not expose uploads without the existing `nosniff` protection or weaken production CORS, Helmet, rate limiting, and body-size limits (`server/src/app.ts`).