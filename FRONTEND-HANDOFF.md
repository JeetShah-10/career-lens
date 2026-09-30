# FRONTEND-HANDOFF.md — CareerLens Frontend Developer Handoff

> **Target Audience:** Pooja (Frontend Engineering) & Pair Programming Agents.
> **Status:** Backend Core API, Auth, Analysis, History, Security, and Automated Tests are Complete.
> **Source of Truth:** This file reflects the verified backend code in `server/src/`. Follow these contracts exactly.

---

## 1. Backend Status Overview

| Component / Feature | Implementation Status | Notes |
|---|---|---|
| **Health Check (`GET /api/health`)** | **Completed & Verified** | Returns `{ "status": "ok" }`. |
| **Authentication (`/api/auth/*`)** | **Completed & Verified** | HttpOnly cookie-based (`token`). Register, login, `/me`, `/logout`. Zero JWTs in JSON/client JS. |
| **Profile Management (`/api/profile`)** | **Completed & Verified** | `GET` (returns canonical empty default if none), `PUT` (upsert with strict validation). Scoped to `req.user.id`. |
| **Resume Analysis (`POST /api/analyses`)** | **Completed & Verified (P0 Paste)** | Validates input, calls Gemini, parses/validates JSON, saves to DB. Returns full structured result. |
| **PDF Upload (`POST /api/analyses`)** | **Deferred to P1 (Not Implemented)** | Backend currently accepts JSON `{ resumeText, targetRole, jobDescription }`. Build the text paste input first. |
| **Analysis History (`GET /api/analyses`)** | **Completed & Verified** | Supports role regex, min/max score, date range (`from`/`to`), sorting, pagination. Lightweight summaries. |
| **Analysis Detail (`GET /api/analyses/:id`)**| **Completed & Verified** | Returns full analysis with `result` payload. Strips raw `resumeText` and `jobDescription`. |
| **Analysis Delete (`DELETE /api/analyses/:id`)**| **Completed & Verified** | Returns `204 No Content`. Scoped to `req.user.id`. |
| **Gemini Fallback (`ai.service.js`)** | **Completed & Tested (Mocked)** | Single bounded fallback from `gemini-3.8-flash` to `gemini-3.5-flash` on 503 spikes. Live fallback test unverified. |
| **Browser Cookie Persistence** | **Pending Live Integration** | Automated test suite passes; cross-site cookie retention across refreshes requires verification in a real browser. |

---

## 2. Safe Local Setup & Environment

The frontend must never receive or configure backend secrets (MongoDB URI, JWT secret, or Gemini API keys).

Create `client/.env` (or `client/.env.local`):
```bash
# Base URL for Express API
VITE_API_URL=http://localhost:5000
```

---

## 3. Authentication & Session Contract

CareerLens uses **secure, persistent HttpOnly cookie authentication**.

### Rules for the Frontend
1. **Never read, decode, or store JWTs:** No tokens in `localStorage`, `sessionStorage`, or React component state.
2. **Credentialed Requests:** All API calls made by Axios or Fetch must enable credentials:
   - **Axios:** `axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true })`
   - **Fetch:** `fetch(url, { credentials: 'include' })`
3. **Session Bootstrap on Startup:** When the React application mounts (e.g. inside `AuthContext`), immediately call `GET /api/auth/me`.
   - If `200 OK`: set `user` in state and render protected pages.
   - If `401 Unauthorized`: set `user = null` and allow public/auth navigation.
4. **Visible Sign Out:** Provide a visible "Sign out" button in the navigation/profile menu. Clicking it calls `POST /api/auth/logout`, clears the React `user` state, and navigates to `/login`.

### Endpoints

#### Register
- **URL:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Validation:** `name` min 2 max 50 chars; valid `email` (auto-lowercased/trimmed); `password` min 8 max 128 chars.
- **Success (`201 Created`):**
  Sets HttpOnly `token` cookie in the browser.
  ```json
  {
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-09-30T17:00:00.000Z"
    }
  }
  ```

#### Login
- **URL:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Success (`200 OK`):** Sets HttpOnly cookie, returns identical `{ user }` object as register.
- **Failure (`401 Unauthorized`):** Returns generic message `"Invalid email or password"`.

#### Current User / Session Check
- **URL:** `GET /api/auth/me`
- **Headers:** Browser transmits cookie automatically.
- **Success (`200 OK`):** Returns `{ "user": { "id": "...", "name": "...", "email": "...", "createdAt": "..." } }`.
- **Failure (`401 Unauthorized`):** Missing or expired cookie.

#### Logout
- **URL:** `POST /api/auth/logout`
- **Success (`200 OK`):**
  Clears the `token` cookie using matching security attributes.
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

## 4. CORS, CSRF & Browser Verification Assumptions

- **CORS:** The Express server is locked to `env.CLIENT_ORIGIN` (default dev: `http://localhost:5173`). Wildcard `*` is prohibited.
- **CSRF Defense:** Modern browsers automatically send `Origin` and `Referer` headers on `POST`, `PUT`, `DELETE` requests.
  - If a cookie-authenticated state-changing request has **missing, malformed, or foreign** Origin/Referer headers, the backend rejects it with `403 FORBIDDEN`.
  - Normal Axios/Fetch calls from the configured Vite app will automatically supply the matching `Origin` header.
- **Pending Live Browser Check:**
  In production, Vercel frontend + Render backend constitutes a cross-site context. The backend sets `SameSite=none; Secure=true`. Once Pooja deploys or links the frontend, verify that Chrome/Safari/Firefox do not block third-party cookies across page refreshes.

---

## 5. Profile Management Contract

Users can save and edit their structured background info.

### Get Profile
- **URL:** `GET /api/profile`
- **Success (`200 OK`):** Returns the saved profile. If the user hasn't saved a profile yet, returns the **canonical empty default**:
  ```json
  {
    "profile": {
      "headline": "",
      "targetRole": "",
      "skills": [],
      "education": [],
      "experience": []
    }
  }
  ```

### Update / Upsert Profile
- **URL:** `PUT /api/profile`
- **Body Schema:**
  ```json
  {
    "headline": "Senior Backend Engineer",
    "targetRole": "Full Stack Tech Lead",
    "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "education": [
      {
        "institution": "University of Tech",
        "degree": "B.S. Computer Science",
        "year": "2020"
      }
    ],
    "experience": [
      {
        "company": "Acme Corp",
        "role": "Senior Developer",
        "duration": "2021 - Present",
        "description": "Architected microservices handling 2M requests/day."
      }
    ]
  }
  ```
- **Field Constraints:**
  - `headline`: max 150 chars.
  - `targetRole`: max 100 chars.
  - `skills`: max 50 items, each max 50 chars.
  - `education`: max 10 items.
  - `experience`: max 10 items (description max 2,000 chars).
- **Success (`200 OK`):** Returns `{ "profile": { ... } }`.

---

## 6. Resume Analysis Creation (`POST /api/analyses`)

### Request Limits & Input
- **URL:** `POST /api/analyses`
- **Rate Limit:** 5 requests per minute per user/IP (`429 RATE_LIMIT_EXCEEDED` if exceeded).
- **Body:**
  ```json
  {
    "resumeText": "John Doe\nExperienced Full Stack Engineer with 5 years in React, Node...",
    "targetRole": "Full Stack Engineer",
    "jobDescription": "Optional target job description to calculate keyword match..."
  }
  ```
- **Validation Constraints:**
  - `resumeText`: Required. String min 50 characters, max 20,000 characters.
  - `targetRole`: Required. String min 2 characters, max 100 characters.
  - `jobDescription`: Optional. String max 10,000 characters. Defaults to empty string.

### Output Result Schema
- **Success (`201 Created`):**
  Returns `{ "analysis": { ... } }`.
  ```json
  {
    "analysis": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "targetRole": "Full Stack Engineer",
      "resumeSource": "paste",
      "overallScore": 82,
      "result": {
        "overallScore": 82,
        "scoreBreakdown": {
          "skills": 85,
          "experience": 80,
          "formatting": 85,
          "impact": 78
        },
        "summary": "Strong candidate with solid full-stack foundations...",
        "strengths": [
          "Demonstrated React 18 architecture experience",
          "Clear quantifiable impact metrics in past roles"
        ],
        "weaknesses": [
          "Missing formal cloud architecture certifications",
          "Limited automated test coverage documentation"
        ],
        "missingSkills": [
          "Docker",
          "Kubernetes",
          "AWS"
        ],
        "recommendedSkills": [
          {
            "skill": "Docker",
            "priority": "high",
            "why": "Essential containerization skill for modern cloud deployments."
          },
          {
            "skill": "AWS",
            "priority": "medium",
            "why": "Frequently requested in senior full-stack job specifications."
          }
        ],
        "careerSuggestions": [
          {
            "role": "Senior Frontend Engineer",
            "matchPercent": 90,
            "reason": "Direct alignment with 5 years of production React experience."
          },
          {
            "role": "Full Stack Systems Developer",
            "matchPercent": 84,
            "reason": "Strong balance of frontend state and Node.js REST services."
          },
          {
            "role": "Technical Lead",
            "matchPercent": 75,
            "reason": "Proven record of mentoring junior engineers and leading migrations."
          }
        ],
        "jobMatch": {
          "matchPercent": 85,
          "matchedKeywords": ["React", "TypeScript", "Node.js"],
          "missingKeywords": ["GraphQL", "Next.js"]
        },
        "roadmap": [
          {
            "step": 1,
            "skill": "Docker",
            "action": "Complete containerization tutorial and dockerize an Express API",
            "timeframe": "2 weeks"
          }
        ]
      },
      "createdAt": "2026-09-30T17:10:00.000Z",
      "updatedAt": "2026-09-30T17:10:00.000Z"
    }
  }
  ```
  *(Note: `jobMatch` and `roadmap` are optional. If no job description is provided, `jobMatch` is omitted).*

---

## 7. Analysis History, Filtering & Summaries

### History List (`GET /api/analyses`)
- **URL:** `GET /api/analyses`
- **Supported Query Parameters:**
  - `role`: string (case-insensitive substring search, e.g. `?role=fullstack`)
  - `minScore`: number 0–100 (e.g. `?minScore=70`)
  - `maxScore`: number 0–100 (e.g. `?maxScore=90`)
  - `from`: ISO 8601 date string (e.g. `?from=2026-09-01T00:00:00Z`)
  - `to`: ISO 8601 date string (e.g. `?to=2026-09-30T23:59:59Z`)
  - `sort`: `'newest'` (default) | `'oldest'` | `'score_desc'` | `'score_asc'`
  - `page`: integer >= 1 (default `1`)
  - `limit`: integer 1–50 (default `10`)

### History Summary Shape
The history list projects out heavy and private fields for performance and data minimization:
```json
{
  "items": [
    {
      "id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "targetRole": "Full Stack Engineer",
      "resumeSource": "paste",
      "overallScore": 82,
      "createdAt": "2026-09-30T17:10:00.000Z",
      "updatedAt": "2026-09-30T17:10:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

### Get Single Analysis Detail (`GET /api/analyses/:id`)
- **URL:** `GET /api/analyses/:id`
- **Success (`200 OK`):** Returns full `{ "analysis": { id, targetRole, resumeSource, overallScore, result, createdAt, updatedAt } }`.
- **Security / IDOR:** If `:id` belongs to another user or doesn't exist, returns `404 NOT_FOUND`.

### Delete Analysis (`DELETE /api/analyses/:id`)
- **URL:** `DELETE /api/analyses/:id`
- **Success (`204 No Content`):** Record deleted permanently.

---

## 8. Data Privacy & Sensitive Fields

The backend enforces data minimization:
- **Never returned in any JSON response:** `passwordHash`, raw `resumeText`, and raw `jobDescription`.
- **Never displayed in history cards:** Raw submitted text is never sent in the list endpoint. Only the target role, date, source, and overall score are shown.

---

## 9. Standard Error Shape

Every error returned by the API adheres to this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable explanation of error",
    "details": [
      {
        "field": "resumeText",
        "message": "Resume text must be at least 50 characters"
      }
    ]
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400): Form inputs failed Zod validation. Check `details[]`.
- `INVALID_ID` (400): Malformed Mongo ObjectId parameter.
- `UNAUTHORIZED` (401): Missing, invalid, or expired cookie.
- `FORBIDDEN` (403): CSRF Origin/Referer check failed.
- `NOT_FOUND` (404): Resource does not exist or belongs to another user.
- `DUPLICATE_EMAIL` (409): Email already registered.
- `RATE_LIMIT_EXCEEDED` (429): Exceeded general, auth, or analysis rate limits.
- `AI_SERVICE_UNAVAILABLE` (502): Gemini API timeout, demand overload, or failed schema validation.
- `INTERNAL_ERROR` (500): Server error.

---

## 10. Frontend Work Breakdown (Pooja's Checklist)

### Phase 1: App Shell & Auth UI
- [ ] Scaffold React + Vite + Tailwind CSS in `client/`.
- [ ] Setup React Router with protected routes (`ProtectedRoute` wrapper checking auth state).
- [ ] Implement `src/api/client.js` Axios instance with `withCredentials: true`.
- [ ] Implement `AuthContext` with startup bootstrap calling `GET /api/auth/me`.
- [ ] Build **Register** (`POST /api/auth/register`) and **Login** (`POST /api/auth/login`) pages with instant validation.
- [ ] Build **Navbar / User Menu** with a visible **Sign Out** button calling `POST /api/auth/logout`.

### Phase 2: Profile & Analysis Core Flow
- [ ] Build **Profile Screen** (`GET /api/profile` and `PUT /api/profile`) with empty default handling.
- [ ] Build **New Analysis Form** (`POST /api/analyses`) supporting:
  - Textarea for resume text (min 50, max 20,000 chars with live counter).
  - Target role input (min 2, max 100 chars).
  - Optional job description textarea.
  - Loading spinner / animated progress states during the 5–15s AI analysis call.
- [ ] Build **Results Page** rendering:
  - Overall score badge and score breakdown bars (`skills`, `experience`, `formatting`, `impact`).
  - Executive summary and strengths/weaknesses tags.
  - Recommended skills with priority badges (`high`/`medium`/`low`) and explanations.
  - Career suggestions with match percentages.
  - Job description keyword match section (if present).

### Phase 3: History & Filters
- [ ] Build **History List Page** (`GET /api/analyses`):
  - Displays summary cards (Target role, date, overall score, source badge).
  - Filter controls: Role search input, min/max score sliders/inputs, sort dropdown (`newest`, `oldest`, `score_desc`, `score_asc`).
  - Pagination controls (`page`, `pages`, `total`).
  - Empty states (for no history, and for filters returning zero items).
  - Delete button on each card (`DELETE /api/analyses/:id`) with optimistic UI or list refresh.
- [ ] Revisit past analysis: clicking a card navigates to `/analyses/:id` (`GET /api/analyses/:id`) and displays the full results view.

### Phase 4: Mobile & Accessibility Polish
- [ ] Test layout at 360px mobile width (ensure zero horizontal scroll).
- [ ] Verify keyboard navigation and readable error banners for all 4xx/5xx status codes.
- [ ] Real browser smoke test verifying persistent sign-in across page reloads.
