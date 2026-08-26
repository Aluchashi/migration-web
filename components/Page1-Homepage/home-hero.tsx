import Link from "next/link";

const metrics = [
  ["Career Match", "Profile-based", "bg-emerald-500"],
  ["Skill Readiness", "Prioritized", "bg-sky-500"],
  ["Learning Progress", "Coming next", "bg-zinc-300"],
];

function ProductOverviewVisual() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-200/60 sm:p-5">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Your preparation</p><p className="mt-1 text-lg font-semibold text-zinc-950">Migration readiness</p></div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">In progress</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {metrics.map(([label, value, tone]) => <div key={label} className="rounded-lg border border-zinc-200 bg-white p-3"><span className={`block h-1.5 w-8 rounded-full ${tone}`} /><p className="mt-3 text-xs font-medium text-zinc-500">{label}</p><p className="mt-1 text-sm font-semibold text-zinc-900">{value}</p></div>)}
        </div>
        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-zinc-950">Prepare with clarity</p><p className="mt-1 text-xs leading-5 text-zinc-500">Career, skills, migration steps, and safety checks in one journey.</p></div><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800" aria-hidden="true">✓</span></div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3"><p className="text-xs font-semibold text-emerald-800">Migration preparation</p><p className="mt-1 text-xs leading-5 text-emerald-900">Know what to prepare before decisions.</p></div><div className="rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="text-xs font-semibold text-amber-900">Scam check</p><p className="mt-1 text-xs leading-5 text-amber-900">Review warning signs before you trust.</p></div></div>
      </div>
    </div>
  );
}

export function HomeHero() {
  return <section className="border-b border-emerald-100 bg-[radial-gradient(circle_at_top_left,_#d1fae5,_transparent_38%),linear-gradient(to_bottom,_#f0fdf4,_#fafaf9)]"><div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-16"><div className="max-w-2xl"><p className="inline-flex rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm">A clearer path forward</p><h1 className="mt-5 text-4xl font-semibold leading-[1.06] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">Go Abroad for Work. Go Prepared.</h1><p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">Plan your career, sharpen your skills, and move forward with migration guidance you can understand.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-800/15 transition hover:-translate-y-px hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">Start Your Journey</Link><a href="#how-it-works" className="inline-flex h-11 items-center justify-center rounded-lg border border-emerald-200 bg-white/90 px-5 text-sm font-semibold text-emerald-900 transition hover:-translate-y-px hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">Explore How It Works</a></div></div><ProductOverviewVisual /></div></section>;
}
