# Page-5 Career & Country Matcher — Progress Note

**তারিখ:** 2026-08-26 • **Branch:** `dukhi-penguin` • Status: ~80% done, evening-এ resume

## ✅ যা যা হয়ে গেছে

1. **`lib/migration-corridors.ts` (নতুন)** — structured corridor dataset: ৭টা MVP corridor
   (Saudi Electrician, UAE Driver, Qatar Construction Helper, Malaysia Factory Operator,
   Oman Cleaner, Korea EPS E-9, Germany Ausbildung)। প্রতিটাতে requirement schema
   (age/experience/education/cert/language/medical), salary, cost cap, timeline,
   demand level, source + lastVerifiedDate + confidence tag (verified/estimated)।
2. **`lib/career-scoring.ts` (নতুন)** — deterministic rule-based engine:
   - Weighted score = skill + language + experience + budget + priority alignment (LLM নয়)
   - Eligibility checks → ✅ eligible / ⚠️ partial / ❌ not-yet (hard vs closeable fail)
   - Tier grouping: 🟢 Best Fit Now / 🟡 Achievable Soon / 🔵 Stretch Option
   - Bangla "Why this?" explanation builder (source citation সহ)
   - What-If simulator logic (gap পূরণ হলে projected score)
3. **`app/dashboard/career-matcher/page.tsx` (rewrite)** — profile থেকে ProfileSnapshot
   build (age DOB থেকে, experience sum, languages, education, budget band...) → engine-এ
   compute। Incomplete profile-এ essential-gaps prompt।
4. **`components/Page5-CareerCountry/career-matcher.tsx` (full rewrite)** — নতুন UI:
   priority sliders (live re-rank), sort (score/salary/cost/timeline/demand), filter
   (region/category), tier sections, match cards (score bar, facts grid, missing chips,
   confidence tag), expandable "Why this?" + "How we calculated", What-If box,
   side-by-side comparison table (max ৩টা), CTA per card।
   - CTA: "View skill gap" → `/dashboard/skill-gap?job=&country=` (prefill link),
     "Legal process" ও "Verify agency" → disabled placeholder (module নেই এখনো)।

**Verify:** `npx tsc --noEmit` ✅ • `npm run lint` ✅ • পুরনো AI route/API/auth সব untouched।

## ⚠️ শেষ মুহূর্তের একটা ঝামেলা (evening-এ প্রথম চেক করব)

শেষ e2e টেস্টে Supabase pooler `:6543` এ connect করা গোনা গেছে (transient বা free-tier
project pause হয়ে থাকতে পারে)। তাই নতুন matcher পেজের **logged-in render টেস্টটা
conclusive হয়নি**। Resume করার সময়: dashboard active কিনা দেখো → `npx prisma migrate status`
চালাও → তারপর টেস্ট।

## 🔲 Evening-এ বাকি (এই ক্রমে)

1. DB connectivity re-check (উপরের ⚠️ দেখো)
2. **Skill-gap prefill wire করা** — `app/dashboard/skill-gap/page.tsx`-এ `searchParams`
   prop যোগ করে `{ job, country }` analyzer-এ pass; `skill-gap-analyzer.tsx`-এ
   `initialJob`/`initialCountry` props → useState default (matcher card-এর link এখনই
   এই query params পাঠায়, receiver side বাকি)
3. Logged-in e2e: test user create → profile data save → matcher পেজে ৭টা corridor
   render + slider/filter/compare চেক → test user delete
4. সিদ্ধান্ত: পুরনো gpt-based `/api/ai/career-matcher` route রাখব নাকি remove (এখন কেউ
   use করছে না; skill-gap পেজ তখনও CareerMatch history থেকে suggestion pull করে)
5. Commit + push (`.env.local` gitignored, safe)

## ▶️ Resume করার কমান্ড

```bash
npm run dev        # http://localhost:3000/dashboard/career-matcher
npx tsc --noEmit && npm run lint
```

Test scripts (temp): `C:\Users\imran\AppData\Local\Temp\opencode\{test-user.js,inspect-db.js}`
