# DEMO-SETUP.md — Local Offline Demo & Data Seeding Guide

> **Audience:** Jeet & Pooja (Presentation & Demo Operations)  
> **Purpose:** Provides a reliable local fallback for the hackathon demo in case of unreliable or dead venue Wi-Fi.  
> **Classification:** Synthetic demonstration fixtures only — not genuine AI assessments or real personal resumes.

---

## 1. Offline vs. Live Demo Scope

| Core Flow / Action | Offline (Zero Wi-Fi Required) | Live Connection Required |
|---|:---:|:---:|
| **User Sign In / Sign Out** (Session Cookies) | **Works 100% Locally** | — |
| **Profile View & Edit** (`GET/PUT /api/profile`) | **Works 100% Locally** | — |
| **Preloaded History Browsing** (Paste, PDF, Profile) | **Works 100% Locally** | — |
| **History Filters & Search** (Role substring, score threshold, sorting) | **Works 100% Locally** | — |
| **Analysis Detail View** (Score breakdowns, strengths, recommendations) | **Works 100% Locally** | — |
| **Analysis Card Deletion** (`DELETE /api/analyses/:id`) | **Works 100% Locally** | — |
| **Submitting a *New* Resume Analysis** (Paste, PDF, Profile) | — | **Requires Gemini API** (Use phone 4G/5G hotspot as backup) |

*Contingency Rule:* If venue Wi-Fi is slow or unavailable on stage, run the presentation on `localhost` against the preloaded synthetic analyses to demonstrate history, filters, and score breakdowns with zero latency. Reserve phone hotspot connectivity solely for demonstrating one new live AI analysis.

---

## 2. Local Docker MongoDB Setup (Persistent & Loopback-Isolated)

Before launching the local backend, a persistent MongoDB database bound exclusively to loopback (`127.0.0.1`) must be running.

### Step 1: Start Docker Desktop
Ensure Docker Desktop is open and running on the presenter's laptop.

### Step 2: Check for an Existing Container Before Creating a New One
Check if a container named `careerlens-mongo` already exists:
```powershell
docker ps -a --filter "name=^careerlens-mongo$" --format "{{.Names}} - {{.Status}}"
```

#### Case A: If `careerlens-mongo` exists, verify its configuration:
Inspect its image, volume mount, and loopback port mapping:
```powershell
docker inspect careerlens-mongo --format 'Image: {{.Config.Image}} | Ports: {{json .HostConfig.PortBindings}} | Mounts: {{json .Mounts}}'
```

- **Required Valid Configuration:**
  - **Image:** `mongo:7`
  - **Port Binding:** Strictly bound to `127.0.0.1:27017` (host IP must be `127.0.0.1`, not `0.0.0.0`)
  - **Volume:** Named volume `careerlens_mongo_data` mounted at `/data/db`
- **If Valid:** Simply start the existing container:
  ```powershell
  docker start careerlens-mongo
  ```
- **If Misconfigured (e.g. Bound to `0.0.0.0` or missing volume):**
  **STOP.** Do not automatically delete or overwrite it. Investigate what is running or choose a different local port/container name so existing data is preserved.

#### Case B: If no container exists, create a new persistent loopback container:
```powershell
docker run -d --name careerlens-mongo -v careerlens_mongo_data:/data/db -p 127.0.0.1:27017:27017 mongo:7
```
- `-v careerlens_mongo_data:/data/db`: Keeps all data persistent across container stops and restarts.
- `-p 127.0.0.1:27017:27017`: Binds strictly to the laptop's loopback interface, completely inaccessible to outside network traffic.

---

## 3. Safe Local Demo Data Seeding

The seeder creates **one synthetic candidate** (`alex.demo@example.test`), a populated profile, and **3 precomputed analyses** (Paste, PDF, and Profile sources) with varied scores (88, 72, 54).

### Hard Safety Constraints (Built-in Refusal Guards):
1. **Production Refusal:** Fails immediately if `NODE_ENV === 'production'`.
2. **Explicit Opt-In Required:** Fails immediately unless `ALLOW_DEMO_SEED === 'true'`.
3. **Loopback Only:** Fails immediately if `MONGODB_URI` points to MongoDB Atlas, an SRV string (`mongodb+srv://`), or any host other than `127.0.0.1` or `localhost`. Connection strings are never printed or leaked.
4. **Interactive Terminal Required:** Refuses to execute if output is piped or redirected (`process.stdout.isTTY === false`), ensuring one-time credentials cannot be silently lost or captured in build logs.
5. **Narrow Scoped Cleanup:** Only deletes documents owned by `alex.demo@example.test`. Never executes broad collection drops.

### Windows Command Execution (No Secrets in Files)

Run in an interactive PowerShell terminal in the `server/` directory:

```powershell
cd server
$env:ALLOW_DEMO_SEED="true"
$env:MONGODB_URI="mongodb://127.0.0.1:27017/careerlens"
npm run seed:demo
Remove-Item Env:\ALLOW_DEMO_SEED
```

Or in Windows Command Prompt (`cmd`):
```cmd
cd server
set ALLOW_DEMO_SEED=true&& set MONGODB_URI=mongodb://127.0.0.1:27017/careerlens&& npm run seed:demo&& set ALLOW_DEMO_SEED=
```

### Password Handling
- The script generates a strong random one-time password at runtime, hashes it with `bcrypt` (cost 12), and displays it **strictly once on the terminal output**.
- **Rule for Presenters:** Note the password on paper or in a private scratchpad during demo rehearsal. **Never paste or commit this password into git, logs, or chat.**

---

## 4. Synthetic Data Marking (Transparency for Judges)

All seeded records are explicitly marked so they cannot be mistaken for real AI assessments:
- **Candidate Email:** `alex.demo@example.test` (RFC 2606 reserved testing domain)
- **Candidate Name:** `Alex Demo-Rivera`
- **Target Roles:**
  - `[DEMO] Full Stack Engineer` (Score: 88, Source: Paste)
  - `[DEMO] Cloud Infrastructure Architect` (Score: 72, Source: PDF)
  - `[DEMO] Machine Learning Engineer` (Score: 54, Source: Profile)
- **Assessment Summary:** Every analysis summary begins with:
  `"[OFFLINE EXHIBITION FIXTURE] ..."`
- **Score Breakdown & Skill Gaps:** Precomputed to demonstrate UI rendering for strong, moderate, and weak job matches without consuming Gemini API tokens or waiting for cloud responses.
