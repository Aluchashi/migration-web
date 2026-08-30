# ProbashBondhu (প্রবাসবন্ধু)

**AI-powered Pre-Migration Intelligence Platform for Bangladeshi overseas workers**

Helping people considering work abroad make informed decisions about career and country fit, skill gaps, legal migration steps, and recruitment-offer risk — instead of relying on brokers or word-of-mouth.

🔗 **Live Demo:** [probashbondhu.vercel.app](https://probashbondhu.vercel.app) <!-- আপনার actual working URL দিয়ে বদলে নিন -->

---

## 📌 The Problem

Every year, thousands of Bangladeshis migrate abroad for work. A large share of them make decisions based on incomplete or unverified information from brokers or acquaintances — leading to wrong country/job choices, scams, or being unprepared on arrival.

**ProbashBondhu** helps a prospective migrant answer five hard questions using their own profile and verified official sources:

| Question | Module |
|---|---|
| Which job/country is right for me? | Career & Country Matcher |
| Am I ready for that job? | Skill Gap Analyzer |
| What should I learn, and where? | Personalized Learning Roadmap |
| What's the legal migration process? | Legal Migration Guidance |
| Is this job offer genuine? | Scam Risk Checker |

---

## ✨ Core Features

- **Career & Country Matcher** — Profile-based scoring across countries and occupations, with eligibility checks and missing-requirement breakdowns.
- **Skill Gap Analyzer** — Retrieval-grounded (RAG) skill gap detection against curated occupation-requirement datasets, not raw LLM guesses — every gap comes with a source citation.
- **Personalized Learning Roadmap** — Phase-based, scroll-animated timeline with per-topic progress tracking and a "Give Up" safety-net flow.
- **Legal Migration Guidance** — Step-by-step official migration process (registration → clearance → departure) with checklists and source/date tags for every claim.
- **Scam Risk Checker** — Deterministic, rule-based risk scoring for recruiting agencies and job offers (never a flat "fake" verdict — transparent, weighted risk indicators only).
- **Bangla-first UI** — Fully localized (English/Bangla) using `next-intl`, with the Hind Siliguri typeface for Bangla text.
- **Email OTP Authentication** — Secure registration with hashed OTPs and pending-registration flow (no unverified accounts persisted).

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Styling / UI | Tailwind CSS, shadcn/ui, Framer Motion |
| Database ORM | Prisma |
| Auth | Email OTP (bcryptjs-hashed), NextAuth |
| Internationalization | next-intl (English / বাংলা) |
| Email | Nodemailer (SMTP) |
| Deployment | Vercel (CI/CD on `main`) |

---

## 🚀 Getting Started (Local Setup)

```bash
# 1. Clone the repository
git clone https://github.com/Aluchashi/ProbashBondhu.git
cd ProbashBondhu

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in the required values — see below

# 4. Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev

# 5. Run the development server
npm run dev
```

Visit `http://localhost:3000`.

### Required Environment Variables

See `.env.example` for the full list. At minimum you'll need:

- `DATABASE_URL` — Postgres (or your configured DB) connection string
- `GMAIL_USER`, `GMAIL_APP_PASSWORD` — for sending OTP/confirmation emails
- Auth-related secrets (session/JWT signing key)

---

## 📁 Project Structure

```
app/          → Next.js App Router pages & API routes
components/   → Reusable UI components (shadcn/ui-based)
hooks/        → Custom React hooks
i18n/         → next-intl request config
lib/          → Utilities (mailer, auth helpers, etc.)
messages/     → en.json / bn.json translation files
prisma/       → Database schema & migrations
public/       → Static assets
types/        → Shared TypeScript types
```

---

## ⚖️ Design Principles

- **Grounded, not guessed** — Career, skill-gap, and legal-guidance content is retrieved from curated, source-tagged datasets rather than generated freely by an LLM.
- **Transparent risk, not verdicts** — The Scam Checker shows *why* something is flagged (with a visible scoring breakdown), and never declares an agency "fake."
- **Privacy-conscious** — Passwords and OTPs are hashed; no plaintext sensitive data is stored.

---

## 🗺 Roadmap

- [ ] Expand beyond the initial 5 migration corridors (Saudi Arabia, UAE, Qatar, Malaysia, South Korea)
- [ ] Official data-sharing partnership with BMET
- [ ] Verified recruiting-agency badge program
- [ ] Optional phone/SMS verification

---

## 🏆 Submitted To

Bangladesh ICT & Innovation Awards 2026

## 📬 Contact

hello@probashbondhu.com <!-- আপনার actual কন্টাক্ট ইমেইল দিয়ে বদলে নিন -->
