const profileFields = [
  "Experience",
  "Skills",
  "Education",
  "Languages",
  "Budget",
  "Preferred region",
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium text-emerald-700">Migration planning</p>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-950 sm:text-5xl">
            Build a profile for your next move.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">
            Organize the experience, preferences, and practical details that shape your migration options.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h2 className="text-base font-semibold text-zinc-950">Profile outline</h2>
            <span className="text-xs text-zinc-500">6 sections</span>
          </div>
          <ul className="mt-2 divide-y divide-zinc-100">
            {profileFields.map((field) => (
              <li key={field} className="flex items-center gap-3 py-3 text-sm text-zinc-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                {field}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
