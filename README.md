# TrustlessEscrow — AI-Powered Freelance Escrow on Razorpay Route

An autonomous, production-ready escrow platform where clients lock project budgets via Razorpay Route, and a 6-agent AI pipeline verifies GitHub milestones to automatically release or hold payments with an integrated Human Appeal mechanism.

---

## Benchmark Metrics & Evaluation Suite

We benchmarked the 6-agent AI audit engine against **18 held-out synthetic PR scenarios** across 8 core engineering domains (Authentication, Payment Security, Backend APIs, Frontend UI, Rate Limiting, Dispute Engines, Build Failures, and Vulnerability Scans):

```
---------------------------------------------------------------
 📊 BENCHMARK METRICS SUMMARY (npm run eval)
---------------------------------------------------------------
  Total Scenarios Evaluated: 18 held-out PR test cases
  Mean Absolute Error (MAE): 5.00%
  Root Mean Square Error:   7.64%
  Verdict Decision Accuracy: 100.0% (18/18 scenarios correctly bucketed)
===============================================================
```

Run the benchmark evaluation:
```bash
npm run eval
```

---

## How It Works

```
Client pays → Razorpay Order
     ↓
Razorpay Route Transfer (on_hold: true) → "escrow locked"
     ↓
Developer submits PR → AI pipeline triggered
     ↓
6 Agents: GitHub → Evidence → Milestone → Verify → Report → Payment
     ↓
AI verdict ≥ 80% → releaseHold() → Developer paid
AI verdict < 20% → reverseTransfer() → Client refunded
20–80% or Disputed → Hold maintained → Human Appeal / Mediation Overlay
```

---

## Quick Start

### Path A: Local Development (Node.js)

```bash
git clone https://github.com/Durgaprasad-Developer/Freelance-Escrow.git
cd Freelance-Escrow
npm install
cp .env.example .env
# Fill in your keys (see Configuration below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Path B: Production Docker Container (Reproducible Setup)

```bash
# 1. Build multi-stage production Docker image
docker build -t freelance-escrow .

# 2. Run container exposing port 3000
docker run -p 3000:3000 --env-file .env freelance-escrow
```

---

## Health Check & Production Observability

Check system health & service connectivity:
```bash
curl http://localhost:3000/api/health
```

- **Pino Structured Logger (`src/lib/logger.ts`)**: JSON logging with automatic redaction of sensitive credentials (`RAZORPAY_KEY_SECRET`, tokens, auth headers).
- **Human Dispute & Appeal API (`/api/appeal`)**: Allows client/developer to file disputes or execute human overrides.

---

## Configuration

Copy `.env.example` to `.env` and fill in:

### Required — Razorpay Route
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com) → **Test Mode** → Settings → API Keys → Generate Key
2. Enable **Route** (Products → Route)
3. Create a Linked Account (Route → Linked Accounts → Create) — no KYC in test mode

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_LINKED_ACCOUNT_ID=acc_...
RAZORPAY_WEBHOOK_SECRET=...    # from Dashboard → Webhooks
```

### Required — AI Agents (at least one)
```env
GROQ_API_KEY=...          # fastest, recommended
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...
NVIDIA_API_KEY=...
```

### Required — GitHub API
```env
GITHUB_TOKEN=...          # for private repo access + higher rate limits
```

### Optional — Database
```env
# Falls back to local JSON file if not set
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Razorpay Webhook Setup

Register `https://your-domain.com/api/payment/webhook` in Razorpay Dashboard → Webhooks.

Subscribe to events:
- `payment.captured`
- `payment.failed`
- `transfer.processed`

---

## Test Cards (Razorpay Test Mode)

| Card Number | Result |
|---|---|
| `4111 1111 1111 1111` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Failure |

CVV: any 3 digits · Expiry: any future date

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── payment/          # Razorpay Order + verify + webhook
│   │   ├── payout/           # Release hold / reversal trigger
│   │   ├── blockchain/       # Mock transaction explorer (UI)
│   │   ├── projects/         # CRUD + milestone planning
│   │   └── verify/           # AI pipeline entry point
│   ├── dashboard/            # Project list + KPI stats
│   ├── new/                  # Create escrow + Razorpay Checkout
│   └── project/[id]/         # Project detail + audit results
└── lib/
    ├── agents/
    │   ├── orchestrator.ts   # Sequential 6-agent pipeline
    │   ├── github.ts         # GitHub API + heuristic fallback
    │   ├── evidence.ts       # Artifact → milestone mapping
    │   ├── milestone.ts      # Completion scoring
    │   ├── payment.ts        # Razorpay hold/release
    │   └── report.ts         # Markdown audit report
    ├── razorpay.ts           # Razorpay Route SDK wrapper
    ├── db.ts                 # JSON file DB (Supabase optional)
    └── types.ts              # Shared TypeScript types
```

---

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Payments**: Razorpay Route (Orders, Transfers, Settlement Hold)
- **AI**: Groq (Llama 3.3 70B) / Gemini / OpenRouter / NVIDIA NIM
- **Data**: GitHub REST API, Supabase (optional), JSON flat-file
- **Deploy**: Vercel-ready (all routes are serverless functions)
