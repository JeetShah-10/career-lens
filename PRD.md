# PRD: CareerLens hackathon MVP

## Outcome

Help a signed-in job seeker understand how a resume relates to a target role, identify practical skill gaps, and revisit prior analyses privately. The deployed app should support a complete demonstration in under three minutes.

## Users and needs

- A student or early-career job seeker wants concrete resume improvements before applying.
- A career switcher wants to compare experience with a target role and plan skills to build.

## MVP and completion criteria

| Capability | Complete when |
|---|---|
| Authentication | Users can register, sign in/out, and cannot access another user's data. |
| Profile management | Users can save and edit headline, target role, skills, education, and experience. |
| Resume input | Users can paste text. PDF upload works with limits and paste fallback if P1 time allows. |
| AI analysis | Server returns schema-validated score/breakdown, strengths, gaps, skill recommendations with reasons, and career suggestions. |
| History and filters | Users can reopen, delete, and filter their own saved analyses by role, score, date, and sort. |
| User experience | Loading, empty, error, and success states work at mobile width and errors are recoverable. |

## After the core flow is deployed (P1)

Add PDF upload, profile-to-analysis, job-description match, score/trend charts, and learning roadmap only when time remains. Keep the pasted-resume flow working as fallback.

## Out of scope

Chatbot, resume builder/export, social login, payments, email verification, password reset, admin panel, job scraping, and real-time features.

## Hackathon success checks

- A first-time user completes the core flow without developer help.
- Provider failure produces a clear recoverable message and saves no partial result.
- Ownership checks prevent cross-user reads and deletes.
- Fake demo data and a short recording are ready as presentation backups.

## Demo flow

Sign in or register, paste a resume, choose a target role, show results and grounded recommendations, reopen history, apply a filter, then explain that scores are coaching estimates, not hiring decisions. Show PDF, job-description match, or charts only if those P1 features are ready.
