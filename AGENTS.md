# AGENTS.md — AI Resume Analyzer & Career Guidance Platform

> **Audience:** AI coding agent (Claude Code, Cursor, Copilot, etc.) working inside this repo.
> **Read this entire file before writing any code.** When this file and your assumptions disagree, this file wins. If something is marked `[TEAM TO CONFIRM]`, ask the human instead of guessing.

---

## 0. Situation

- This is a **hackathon finale project**, assigned as "Definition 30". It must be built in roughly **18 hours** and demoed to judges.
- The judges grade against the original definition (Section 1) and the technology line (Section 3). Both are treated as a rubric.
- **Priority order: working end-to-end > deployed > secure and validated > polished > ambitious.** A small app that works on stage beats a large one that breaks.
- Do not build anything not listed in this document. See Section 9 (Out of scope).

---

## 1. The original definition (verbatim from the organizers)

**Category:** AI / Career

**Project definition:** A career platform where users manage resume information, receive AI-assisted analysis and recommendations, and store analysis history.

**Expected full-stack features:** Authentication · resume/profile management · AI API integration · skill recommendations · career suggestions · analysis history · filters · secure backend · database

**Technology:** React.js frontend, Node.js + Express.js backend, REST APIs, database, validation, error handling and responsive UI.

---

## 2. Plain-language meaning

The whole product is one sentence:

> Users put in their resume info → an AI analyzes it and gives recommendations → every analysis is saved so they can look back at it.

The definition has three verbs. Each verb is a core flow:

| Verb | Meaning | What to build |
|---|---|---|
| **Manage** resume information | User can create, view, edit, delete their own data | Profile + resume CRUD |
| **Receive** AI analysis | User submits resume, AI returns structured feedback | AI integration + results page |
| **Store** analysis history | Every analysis is saved per user and can be revisited | Database + history page + filters |

### The core loop (this is the product)

```
Register/Login
  → Fill profile and/or upload-or-paste resume, pick target role (+ optional job description)
  → Backend validates input
  → Backend calls AI, validates the AI's JSON output
  → Backend saves the analysis to the database
  → Results page (score, skills, careers)
  → History page (list, filters, revisit, compare over time)
```

If this loop works end-to-end and is deployed, the baseline is won. Everything else is extra.

---

## 3. Every feature, decoded (this is the rubric)

Each row is something the judges can check. "Done when" is the acceptance test.

### 3.1 Authentication
- **Meaning:** Users sign up, log in, log out, and can only see their own data.
- **Build:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`. Passwords hashed with bcrypt. JWT for sessions. Protected routes on both backend and frontend.
- **Done when:** An unauthenticated request to any non-auth API route returns 401. A logged-out user visiting a protected page is redirected to login. Passwords are never stored or returned in plain text.

### 3.2 Resume / profile management
- **Meaning:** The user's data lives in the app, not just in a one-off upload. **Decision: both a structured profile and resume upload/paste.**
- **Build:**
  - Profile: headline, target role, skills (list), education (list), experience (list). Full create/read/update.
  - Resume input for analysis: paste text **or** upload a PDF (PDF parsed server-side to text).
  - Third input option: "Analyze my profile", which serializes the saved profile to text and uses that as the resume text. This connects profile management to the analysis.
- **Done when (P0):** A user can save their profile, leave, come back, and find it unchanged; they can analyze pasted resume text. **P1:** They can also analyze a PDF or saved profile if time remains.

### 3.3 AI API integration
- **Meaning:** The backend sends resume text to an LLM and gets structured results back.
- **Build:** One service file, `services/ai.service.js`, is the only place that talks to the AI provider. Use Google Gemini API as the primary provider with a stable Flash model selected via `GEMINI_MODEL`. Keep the provider call isolated in this service, but do not build multi-provider switching. Output uses native JSON-schema structured output where supported and must pass the Section 6 Zod schema.
- **Done when:** A valid analysis request returns a result that passes schema validation. A malformed AI response triggers one retry and then a clean error, never a crash or a half-saved record.

### 3.3.1 AI rules (non-negotiable)
- The AI is **called only from the backend**. The API key never reaches the frontend or the repo.
- Prompt asks for **JSON only**, with low temperature. Code strips any markdown fences, runs `JSON.parse`, then validates with zod.
- Truncate resume text to a safe length before sending (e.g. 12,000 characters).
- Rate-limit the analysis endpoint per user/IP.
- Advice must be **grounded in the actual resume**. The prompt must tell the model to reference real content and never invent experience. Generic advice like "learn more tech" is a failure.

### 3.4 Skill recommendations
- **Meaning:** "Here are skills you're missing for your target role."
- **Build:** `recommendedSkills[]`, each with `skill`, `priority` (`high`/`medium`/`low`) and `why`. Plus `missingSkills[]` as a plain list.
- **Done when:** The results page shows recommended skills with visible priority and a reason for each.

### 3.5 Career suggestions
- **Meaning:** "Based on your profile, these roles fit you."
- **Build:** `careerSuggestions[]`, each with `role`, `matchPercent` (0-100) and `reason`. Return 3-5 items.
- **Done when:** The results page shows 3-5 roles with match % and a reason tied to the resume.

### 3.6 Analysis history
- **Meaning:** Past analyses are saved and viewable later.
- **Build:** Every successful analysis is saved to the database with its full result. History page lists them (role, score, date). Clicking one opens the full result. Users can delete an analysis.
- **Done when:** Refreshing the browser or logging in on another device still shows past analyses. User A can never see user B's analyses.

### 3.7 Filters
- **Meaning:** Narrow down the analysis history.
- **Build:** `GET /api/analyses` supports `role` (text match), `minScore`, `maxScore`, `from`, `to` (dates), `sort` (`newest` | `oldest` | `score_desc` | `score_asc`), plus `page` and `limit`. The frontend has matching controls.
- **Done when:** Changing any filter changes the list, combined filters work together, and an empty result shows a clear "no results" state.

### 3.8 Secure backend
- **Meaning:** The API and data are protected. **This is explicitly listed, so judges will look for it.**
- **Build:** See Section 8.

### 3.9 Database
- **Meaning:** Persistent storage. **Decision: MongoDB Atlas + Mongoose.** Collections: `users`, `profiles`, `analyses`.

---

## 4. The technology line is also graded

The technology line is a checklist. Treat each item as a requirement, not polish.

| Item | What "done" looks like |
|---|---|
| **React.js frontend** | React (Vite). Component-based, React Router, protected routes, API calls through one client module |
| **Node.js + Express.js backend** | Express app with routes → controllers → services separation |
| **REST APIs** | Resource-based URLs, correct HTTP verbs, correct status codes (200, 201, 400, 401, 403, 404, 409, 422, 429, 500) |
| **Database** | Persistent, per-user scoped, with indexes on fields used by filters |
| **Validation** | Validated on **both** frontend (instant feedback) and backend (zod, on every route that accepts input). Never trust the frontend alone |
| **Error handling** | Central Express error middleware, consistent error shape (Section 7). Frontend shows a readable message for every failure mode. **No blank screens, no uncaught exceptions, no raw stack traces to the client** |
| **Responsive UI** | Usable at 360px wide, tablet and desktop. No horizontal scroll. Judges often test this by resizing the browser |

### Failure modes that must be handled with a visible message
Wrong password · duplicate email · expired/invalid token · invalid form input · non-PDF or oversized upload · unreadable or empty PDF · AI provider down/timeout/rate-limited · AI returned invalid JSON · network offline · empty history · empty filter result · rate limit hit.

---

## 5. Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite, React Router, Axios or fetch wrapper, a chart library (Recharts) for score breakdown/trend, plain CSS or Tailwind `[TEAM TO CONFIRM]` |
| Backend | Node.js, Express, `zod`, `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`, `express-rate-limit`, `multer`, `pdf-parse`, `dotenv` |
| Database | MongoDB Atlas + Mongoose (default) |
| AI | Google Gemini API, stable Flash model, configured with `GEMINI_API_KEY` and `GEMINI_MODEL` |
| Deploy | Frontend: Vercel · Backend: Render · DB: Atlas |

### Suggested structure

```
/client
  /src
    /api          # one API client, attaches JWT, handles 401
    /components   # shared UI
    /pages        # Login, Register, Dashboard, Profile, NewAnalysis, Result, History
    /context      # AuthContext
/server
  /src
    /config       # env, db connection
    /middleware   # auth, validate, errorHandler, rateLimit, upload
    /models       # User, Profile, Analysis
    /routes
    /controllers
    /services     # ai.service.js, pdf.service.js
    /validators   # zod schemas
    app.js
    server.js
```

---

## 6. AI output contract (single source of truth)

Both backend validation and frontend rendering must match this shape exactly. If it changes, change it everywhere at once and tell the team.

```js
// zod schema (server/src/validators/analysis.validator.js)
const AnalysisResult = z.object({
  overallScore: z.number().int().min(0).max(100),
  scoreBreakdown: z.object({
    skills: z.number().int().min(0).max(100),
    experience: z.number().int().min(0).max(100),
    formatting: z.number().int().min(0).max(100),
    impact: z.number().int().min(0).max(100),
  }),
  summary: z.string().max(600),
  strengths: z.array(z.string()).min(1).max(8),
  weaknesses: z.array(z.string()).min(1).max(8),
  missingSkills: z.array(z.string()).max(15),
  recommendedSkills: z.array(z.object({
    skill: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    why: z.string(),
  })).min(1).max(10),
  careerSuggestions: z.array(z.object({
    role: z.string(),
    matchPercent: z.number().int().min(0).max(100),
    reason: z.string(),
  })).min(3).max(5),
  // Optional extras, only when time allows:
  jobMatch: z.object({
    matchPercent: z.number().int().min(0).max(100),
    matchedKeywords: z.array(z.string()),
    missingKeywords: z.array(z.string()),
  }).optional(),
  roadmap: z.array(z.object({
    step: z.number().int(),
    skill: z.string(),
    action: z.string(),
    timeframe: z.string(),
  })).optional(),
});
```

**Prompt requirements:** role = "experienced technical recruiter and career coach"; return only JSON matching the schema; base every point on the resume text; scoring must be justified by the content (an empty or weak resume must score low); if a job description is provided, fill `jobMatch`; if not, omit it.

---

## 7. Data models and API contract

### Models

**User:** `name`, `email` (unique, lowercased), `passwordHash`, `createdAt`

**Profile** (one per user): `userId` (unique), `headline`, `targetRole`, `skills: [String]`, `education: [{ institution, degree, year }]`, `experience: [{ company, role, duration, description }]`, `updatedAt`

**Analysis:** `userId` (indexed), `resumeText`, `resumeSource` (`"paste" | "pdf" | "profile"`), `targetRole` (indexed), `jobDescription?`, `overallScore` (indexed, denormalized from result for filtering), `result` (the full object from Section 6), `createdAt` (indexed)

### Endpoints

```
POST   /api/auth/register        { name, email, password }        -> 201 { token, user }
POST   /api/auth/login           { email, password }              -> 200 { token, user }
GET    /api/auth/me                                               -> 200 { user }

GET    /api/profile                                               -> 200 { profile }   (empty default if none)
PUT    /api/profile              { headline, targetRole, skills, education, experience } -> 200 { profile }

POST   /api/analyses             multipart or JSON:
                                 { source: "paste"|"pdf"|"profile", resumeText?, file?, targetRole, jobDescription? }
                                                                  -> 201 { analysis }
GET    /api/analyses             ?role=&minScore=&maxScore=&from=&to=&sort=&page=&limit=
                                                                  -> 200 { items, total, page, pages }
GET    /api/analyses/:id                                          -> 200 { analysis }
DELETE /api/analyses/:id                                          -> 204
```

### Error shape (every error, everywhere)

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [{ "field": "email", "message": "Invalid email" }]
  }
}
```

`details` is optional (used for validation errors). Each item in `details` contains only a safe field path and message—never submitted values, passwords, resume text, or other personal data. Never send stack traces or internal error text to the client.

---

## 8. Security checklist (judges will check)

- [ ] Passwords hashed with bcrypt (cost 10+). `passwordHash` never returned in any response.
- [ ] JWT secret and AI key in `.env`. `.env` is gitignored. Provide `.env.example` with placeholders only.
- [ ] Auth middleware on every route except register/login/health.
- [ ] **Every query on profiles and analyses filters by `req.user.id`.** `GET/DELETE /api/analyses/:id` returns 404 if the record belongs to someone else. This is the most common hackathon security bug.
- [ ] `helmet`, CORS restricted to the frontend origin (env var), request body size limit.
- [ ] `express-rate-limit`: general limit on all routes, stricter limit on `/api/auth/*` and `POST /api/analyses`.
- [ ] Zod validation on every route that accepts input. Reject unknown or oversized fields.
- [ ] File upload: PDF only (check mimetype), 5 MB max, memory storage, no writing arbitrary files to disk.
- [ ] Sanitize filter inputs. Escape regex when doing the `role` text match. Never pass raw query objects into Mongo queries.
- [ ] Generic login failure message ("Invalid email or password"). Do not reveal which one was wrong.

---

## 9. Scope and priorities

### P0: must work (build first, in this order)
1. Repo setup, env files, DB connection, health route
2. Auth (register/login/me) + frontend auth pages + protected routes
3. Profile GET/PUT + profile page
4. `POST /api/analyses` with paste input + AI service + zod validation + save
5. Results page (score, breakdown, strengths/weaknesses, skills, careers)
6. History list + detail + delete + filters + sort
7. Validation and error handling pass, responsive pass
8. Deploy

### P1: only after P0 works end-to-end **and is deployed**
1. PDF upload (with paste as fallback, never remove paste)
2. "Analyze my profile" source
3. Job description match (`jobMatch`)
4. Score breakdown chart and score trend across history
5. Learning roadmap

## Team split

| Owner | Main slice | Shared finish criteria |
|---|---|---|
| Jeet | Express API, MongoDB models, authentication, PDF limits/parsing, Gemini integration, backend deployment settings | Follows the API and security contracts here and can demonstrate the happy path plus one safe failure. |
| Pooja | React app shell, auth/profile forms, analysis and results pages, history/filters, responsive behavior and UI states | Uses agreed API shapes, has no provider secret, and supports loading, empty, error, and success states. |

Both own the shared result contract, integration, deployed smoke check, fake demo data, README/demo script, and final review. Agree on changes to shared contracts before implementing them on either side.

### Out of scope (do NOT build)
Chatbots · resume builder or PDF export · social login · payments · email verification · password reset · admin panel · multi-provider AI support · real-time features · dark mode.

---

## 10. Rules for the coding agent

1. **Build in small vertical slices**, each one runnable, before starting the next. Never leave the app in a broken state between slices.
2. **Do not add features, libraries or files outside this document** without asking.
3. **Follow the contracts in Sections 6 and 7 exactly.** Do not rename fields.
4. **Never call the AI from the frontend.** Never hardcode secrets.
5. **Every route needs validation and error handling before it is considered done.**
6. **Every frontend data fetch needs three states:** loading, error, success (plus empty where relevant).
7. **Write simple, readable code.** The team must be able to explain every file to the judges. No clever abstractions.
8. **Comment the non-obvious parts** (why the AI output is stripped and validated, why queries are scoped by user).
9. **When you finish a slice, list what you built, how to run it, and how to test it** (a curl command or a click path).
10. **If a requirement is ambiguous or marked `[TEAM TO CONFIRM]`, ask. Do not silently choose.**

---

## 11. Definition of done (per feature and overall)

- Acceptance test in Section 3 passes for the feature.
- Error states in Section 4 are handled.
- Works at 360px width.
- No secrets in the repo. `.env.example` exists.
- Deployed version works, not just localhost.
- README contains: what it is, stack, how to run, env vars, API summary, screenshots.

### Demo flow (the app must support this smoothly)
Register → fill profile → paste a weak resume + target role → show a low score with breakdown → show skill and career recommendations → (if built) paste a job description to show match % → open history → apply a filter → show score trend. Keep it under 3 minutes. Keep a seeded demo account as a fallback.

---

## 12. Open items `[TEAM TO CONFIRM]`

- CSS approach (plain CSS vs Tailwind)
- Confirm the selected Gemini Flash model is available to the project and its live quota is adequate for the demo.

## 13. Provider setup and quota notes

Primary is Gemini because its current stable `gemini-3.8-flash` model supports schema-constrained JSON output and Google AI Studio is quick to provision. Google describes it as its most intelligent Flash model. Free-tier RPM/TPM/RPD limits depend on project and model and can change; Google does not guarantee actual capacity. The Free tier has no spend-based rate limit, but request/token limits still apply.

Recommended fallback provider: Groq with `openai/gpt-oss-20b`, which offers strict JSON Schema output and an OpenAI-compatible Node SDK. Groq's published Free plan currently lists 30 RPM and 1,000 requests/day for this model; token caps apply too, and account limits can vary, so confirm the live limits. Because this project explicitly keeps one AI provider in scope, provision the Groq key as a contingency but do not implement provider switching unless the team deliberately moves it into P0. Until then, use a pre-generated fake-resume result or recording if Gemini is unavailable. Hugging Face Inference Providers gives free accounts currently $0.10 monthly routed credit, so it is not a reliable fallback for the live demo.

To obtain the primary key: sign in to [Google AI Studio API Keys](https://aistudio.google.com/app/apikey), accept the terms, choose/import a project, create a Gemini-restricted/auth key, and check the project's model limits. Put the value in server-only `GEMINI_API_KEY` in ignored `.env` locally and the deployment secret settings. Set `GEMINI_MODEL=gemini-3.8-flash`. Never put either value in React, a `VITE_` variable, source control, screenshots, or chat. Keep `.env.example` names/placeholders only. For the fallback, create a key at [Groq Console](https://console.groq.com/keys), inspect its live limits, and keep it only in a server secret as `GROQ_API_KEY`; no need to connect it during the initial build.

Official references: [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output), [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), [Gemini API key management](https://ai.google.dev/gemini-api/docs/api-key), [Groq structured outputs](https://console.groq.com/docs/structured-outputs), [Groq rate limits](https://console.groq.com/docs/rate-limits), [Hugging Face Inference Providers pricing](https://huggingface.co/docs/inference-providers/en/pricing).

## 14. Product experience documents

Use [ANTI-SLOP.md](ANTI-SLOP.md) for concrete UI, copy, accessibility, and state guidance. [PRD.md](PRD.md) summarizes the user outcome, scope, and acceptance demo. This file remains the source of truth for detailed implementation contracts; [SECURITY.md](SECURITY.md) governs security details. Keep the three aligned when requirements change.
