# krow — AI-Verified Freelance Escrow on Razorpay Route

An autonomous, production-ready escrow platform where clients lock project budgets via Razorpay Route, and a multi-agent AI verification pipeline inspects GitHub milestones to automatically release funds, reverse payments, or gate low-confidence verdicts into human dispute resolution.

---

## Architecture & Security Guards

### 🛡️ 1. Code Guard Pattern Inspection (`src/lib/agents/milestone.ts`)
Static pre-inspection scans pull request diffs and source code snippets before milestone scoring:
- **Dynamic Hazards:** Detects `eval()` and `new Function()` patterns.
- **SQL Hazards:** Detects unvalidated string concatenation in SQL queries (`SELECT ... +`).
- **Stub Detection:** Hard-caps milestone scores at **`<15%` (`Not Started`)** if matching files contain only comments, `// TODO` markers, or under 25 bytes of implementation logic.

### ⚖️ 2. Bounded & Gated Dispute Routing (`src/lib/agents/payment.ts`)
Escrow releases are strictly bounded to prevent automated payouts on questionable work:
- **Automated Payout (`Released`):** Triggered **only** when completion score is $\ge 80\%$ **AND** auditor confidence is $\ge 60\%$.
- **Automated Refund (`Refunded`):** Triggered when completion score is $< 20\%$.
- **Auto-Gated Dispute (`Disputed`):** Mid-range scores ($20\% - 79\%$) or low confidence ($< 60\%$) automatically lock settlement holds in `Disputed` state for human mediation.

### 🧮 3. Deterministic Payout Arithmetic
The money-moving logic is **100% mathematical**:
$$ \text{Completion \%} = \frac{\sum (\text{score}_i \times \text{weight}_i)}{\sum \text{weight}_i} $$
The AI agents only extract evidence and score implementation quality—the payout amount is computed deterministically.

---

## System Workflow

```
Client locks budget → Razorpay Route (hold_status: "on_hold")
     ↓
Developer submits GitHub PR → AI Pipeline Triggered
     ↓
Agents: GitHub Scan → Evidence Mapping → Milestone Code Guard → Payment Math → Executive Report
     ↓
Score ≥ 80% & Confidence ≥ 60% → releaseHold() → Settlement to Developer
Score < 20%                   → reverseTransfer() → Refund to Client
Score 20–79% or Low Confidence → Auto-Gated Dispute → Human Appeal Overlay
```

---

## Quick Start

### Local Development (Node.js)

```bash
git clone https://github.com/Durgaprasad-Developer/Freelance-Escrow.git
cd Freelance-Escrow
npm install
cp .env.example .env
# Configure environment keys (see Configuration below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Docker Container

```bash
# 1. Build multi-stage production Docker image
docker build -t freelance-escrow .

# 2. Run container exposing port 3000
docker run -p 3000:3000 --env-file .env freelance-escrow
```

---

## Production Health & Observability

Verify system health & service connectivity:
```bash
curl https://freelance-escrow-two.vercel.app/api/health
```

- **Health Endpoint (`/api/health`)**: Monitors live API, Supabase connection, Razorpay credentials, and Groq API readiness.
- **Pino Structured Logger (`src/lib/logger.ts`)**: JSON logging with automatic redaction of sensitive credentials (`RAZORPAY_KEY_SECRET`, tokens, auth headers).
- **Human Dispute API (`/api/appeal`)**: Endpoint for clients/developers to request manual review for disputed payouts.

---

## Configuration

Copy `.env.example` to `.env` and fill in:

### 1. Razorpay Route (Required)
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com) → **Test Mode** → Settings → API Keys → Generate Key
2. Enable **Route** (Products → Route)
3. Create a Linked Account (Route → Linked Accounts → Create)

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_LINKED_ACCOUNT_ID=acc_...
RAZORPAY_WEBHOOK_SECRET=...
```

### 2. Supabase Persistence (Required for Production)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. AI Agents & GitHub API
```env
GROQ_API_KEY=gsk_...       # Primary LLM provider
GITHUB_TOKEN=github_pat_...  # GitHub API rate-limit prevention
```

---

## Known Limitations & V2 Roadmap

1. **Open-Access Demo Mode:** For hackathon accessibility, project creation uses session-level client identifiers (`client_id`). Production multi-tenant Supabase Auth & Razorpay Merchant OAuth onboarding are roadmapped for V2.
2. **Groq API Rate Limits:** Under heavy load (30 RPM), the pipeline automatically fails over to Gemini, NVIDIA NIM, or local evaluation heuristics.
3. **Sandboxed Execution:** Dynamic container unit test execution (`npm test` in isolated micro-vms) is roadmapped for V2 to complement static Code Guard analysis.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Vanilla CSS Design System
- **Payments**: Razorpay Route (Orders, Transfers, Settlement Holds)
- **AI Infrastructure**: Groq (Llama 3.3 70B), Gemini, NVIDIA NIM
- **Persistence**: Supabase (PostgreSQL), GitHub REST API
- **Deployment**: Vercel Serverless Functions + Docker Containerization
