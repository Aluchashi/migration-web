import Link from "next/link";

import { HomeSectionHeading } from "@/components/Page1-Homepage/home-section-heading";

const questions = [
  ["Which job is right for me?", "Career Matcher"],
  ["Am I ready for that job?", "Skill Gap Analysis"],
  ["What should I know before I migrate?", "Legal Migration Guidance"],
  ["Is this job offer genuine?", "Scam Checker"],
];
const journey = ["Profile", "Career", "Skills", "Learning", "Migration", "Safety"];
const features = [
  ["Career Matcher", "Find career paths that fit your skills, experience, education, and goals.", "Available", "/dashboard/career-matcher"],
  ["Skill Gap Analysis", "Understand which skills you already have and which skills you need to develop.", "Available", "/dashboard/skill-gap"],
  ["Personalized Learning Roadmap", "Get a structured learning path based on your target career and skill gaps.", "Coming Next", ""],
  ["Legal Migration Guidance", "Understand important migration steps, requirements, documents, and considerations before going abroad.", "Coming Next", ""],
  ["Scam Checker", "Identify potential warning signs in suspicious job offers, recruiters, payment requests, or migration claims.", "Coming Next", ""],
];

export function ProblemSection() {
  return <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"><HomeSectionHeading title="Going Abroad for Work Comes With Difficult Questions." /><div className="mt-10 grid gap-4 sm:grid-cols-2">{questions.map(([question, feature], index) => <article key={question} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow sm:p-6"><div className="flex items-start justify-between gap-4"><h3 className="text-lg font-semibold text-zinc-950">{question}</h3><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">0{index + 1}</span></div><p className="mt-5 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">{feature}</p></article>)}</div></section>;
}

export function JourneySection() {
  return <section className="border-y border-zinc-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"><HomeSectionHeading center title="From Your Profile to a Better Migration Decision." /><ol className="mx-auto mt-12 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-6">{journey.map((step, index) => <li key={step} className="relative rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-5 text-center"><span className="text-xs font-semibold text-emerald-700">0{index + 1}</span><p className="mt-2 font-semibold text-zinc-950">{step}</p>{index < journey.length - 1 ? <span className="absolute -bottom-4 left-1/2 text-zinc-400 sm:hidden" aria-hidden="true">↓</span> : null}</li>)}</ol></div></section>;
}

export function FeatureGrid() {
  return <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"><HomeSectionHeading title="Everything You Need Before You Go." /><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{features.map(([title, , status, href]) => {
    const featured = title === "Scam Checker";
    const className = `rounded-xl border bg-white p-5 shadow-sm transition sm:p-6 ${featured ? "border-emerald-300 ring-1 ring-emerald-100" : "border-zinc-200"} ${href ? "hover:border-emerald-300 hover:shadow" : ""}`;
    const content = <><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold text-zinc-950">{title}</h3><span className={status === "Available" ? "shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600"}>{status}</span></div>{href ? <span className="mt-5 inline-block text-sm font-semibold text-emerald-800">Explore feature <span aria-hidden="true">→</span></span> : null}</>;
    return href ? <Link key={title} href={href} className={className}>{content}</Link> : <article key={title} className={className}>{content}</article>;
  })}</div></section>;
}

export function ScamCheckerHighlight() {
  const checks = ["Job Offer", "Recruiter Information", "Salary / Benefits", "Visa Claims", "Payment Requests", "AI Analysis", "Potential Warning Signs"];
  return <section className="border-y border-emerald-100 bg-emerald-50/60"><div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16"><div><HomeSectionHeading title="Not Sure About a Job Offer?" /><button type="button" disabled aria-describedby="scam-checker-note" className="mt-7 inline-flex h-11 cursor-not-allowed items-center justify-center rounded-md bg-zinc-400 px-5 text-sm font-semibold text-white" title="Scam Checker is coming next">Check an Offer — Coming Next</button><p id="scam-checker-note" className="mt-4 max-w-xl text-xs leading-5 text-zinc-600">Risk indicators only — not a legal or fraud determination.</p></div><div className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6"><p className="text-sm font-semibold text-zinc-950">Check before you trust</p><ol className="mt-5 space-y-2">{checks.map((check, index) => <li key={check} className="flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5"><span className={index === checks.length - 1 ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900" : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800"}>{index + 1}</span><span className="text-sm font-medium text-zinc-800">{check}</span></li>)}</ol></div></div></section>;
}

export function PlatformDetails() {
  const differentiators = ["Profile-based", "Personalized", "Practical", "Connected", "Safety-focused"];
  const steps = [["01", "Build Your Profile"], ["02", "Get Personalized Insights"], ["03", "Prepare Before You Go"]];
  const trust = ["Verify AI guidance with official sources.", "Informational guidance, not legal advice.", "Scam Checker provides risk indicators, not a fraud verdict.", "Your data should be handled responsibly."];
  return <><section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"><HomeSectionHeading title="More Than Answers. A Connected Journey." /><div className="mt-10"><ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-3xl" aria-label="Platform differentiators">{differentiators.map((item) => <li key={item} className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm">{item}</li>)}</ul></div></section><section id="how-it-works" className="border-y border-zinc-200 bg-white scroll-mt-20"><div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"><HomeSectionHeading center title="How It Works" /><ol className="mt-10 grid gap-4 md:grid-cols-3">{steps.map(([number, title]) => <li key={number} className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6"><span className="text-sm font-bold text-emerald-700">{number}</span><h3 className="mt-5 text-lg font-semibold text-zinc-950">{title}</h3></li>)}</ol></div></section><section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"><HomeSectionHeading center title="Guidance You Can Understand and Verify." /><ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">{trust.map((point) => <li key={point} className="rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-700 shadow-sm">{point}</li>)}</ul></section></>;
}

export function DashboardPreview() {
  const items = [["Career Match", "Available", "Country and job suggestions based on your profile."], ["Skill Gap", "Available", "Prioritized skills for a target role and country."], ["Learning Roadmap", "Coming Next", "Structured priorities from your skill gaps."], ["Migration Guidance", "Coming Next", "Preparation information and considerations."], ["Scam Check", "Coming Next", "Potential warning signs to review before you trust."]];
  return <section className="border-y border-zinc-200 bg-zinc-50"><div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"><HomeSectionHeading center title="Your Migration Preparation, In One Place." /><div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg shadow-zinc-200/60"><div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 sm:px-5"><div className="flex gap-1.5" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-zinc-300" /><span className="h-2.5 w-2.5 rounded-full bg-zinc-300" /><span className="h-2.5 w-2.5 rounded-full bg-zinc-300" /></div><p className="text-xs font-semibold text-zinc-500">Migration Readiness</p></div><div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[170px_1fr]"><aside className="rounded-lg bg-zinc-950 p-4 text-zinc-300"><p className="text-sm font-semibold text-white">Your journey</p><ul className="mt-4 space-y-3 text-xs"><li className="font-semibold text-emerald-300">Overview</li><li>Profile</li><li>Career Matcher</li><li>Skill Gap</li></ul></aside><div><div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Preparation status</p><p className="mt-1 text-xl font-semibold text-zinc-950">Build your profile to begin</p></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{items.map(([title, status]) => <article key={title} className="rounded-lg border border-zinc-200 p-4"><div className="flex items-start justify-between gap-3"><h3 className="text-sm font-semibold text-zinc-950">{title}</h3><span className={status === "Available" ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800" : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600"}>{status}</span></div></article>)}</div></div></div></div></div></section>;
}
