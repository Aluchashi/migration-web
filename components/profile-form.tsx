"use client";

import { useFormState, useFormStatus } from "react-dom";

import { saveProfile, type ProfileActionState } from "@/app/actions/profile";

type ProfileValues = {
  currentJob: string;
  yearsExperience: number | null;
  skills: string[];
  education: string;
  languages: string[];
  budget: string;
  preferredRegion: string;
};

type ProfileFormProps = {
  initialValues: ProfileValues;
};

const initialState: ProfileActionState = {};
const budgets = [
  "Under BDT 5 lakh",
  "BDT 5-10 lakh",
  "BDT 10-20 lakh",
  "Above BDT 20 lakh",
];
const regions = ["Europe", "Middle East", "Asia-Pacific", "North America"];

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400"
    >
      {pending ? "Saving..." : "Save profile"}
    </button>
  );
}

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const [state, formAction] = useFormState(saveProfile, initialState);

  function fieldClass(field: keyof NonNullable<ProfileActionState["fieldErrors"]>) {
    return [
      "h-11 w-full rounded-md border bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400",
      state.fieldErrors?.[field]
        ? "border-red-400 ring-2 ring-red-100 focus:border-red-500"
        : "border-zinc-300 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100",
    ].join(" ");
  }

  function error(field: keyof NonNullable<ProfileActionState["fieldErrors"]>) {
    const message = state.fieldErrors?.[field];
    return message ? <p className="mt-1.5 text-sm text-red-600">{message}</p> : null;
  }

  return (
    <form action={formAction} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="currentJob" className="mb-2 block text-sm font-medium text-zinc-800">
            Current job
          </label>
          <input
            id="currentJob"
            name="currentJob"
            type="text"
            maxLength={120}
            defaultValue={initialValues.currentJob}
            className={fieldClass("currentJob")}
            placeholder="e.g. Garment quality inspector"
          />
          {error("currentJob")}
        </div>

        <div>
          <label htmlFor="yearsExperience" className="mb-2 block text-sm font-medium text-zinc-800">
            Years of experience
          </label>
          <input
            id="yearsExperience"
            name="yearsExperience"
            type="number"
            inputMode="numeric"
            min={0}
            max={60}
            step={1}
            defaultValue={initialValues.yearsExperience ?? ""}
            className={fieldClass("yearsExperience")}
            placeholder="0"
          />
          {error("yearsExperience")}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="skills" className="mb-2 block text-sm font-medium text-zinc-800">
            Skills
          </label>
          <input
            id="skills"
            name="skills"
            type="text"
            defaultValue={initialValues.skills.join(", ")}
            className={fieldClass("skills")}
            placeholder="Quality control, Excel, team leadership"
          />
          <p className="mt-1.5 text-xs text-zinc-500">Separate skills with commas.</p>
          {error("skills")}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="education" className="mb-2 block text-sm font-medium text-zinc-800">
            Education
          </label>
          <input
            id="education"
            name="education"
            type="text"
            maxLength={160}
            defaultValue={initialValues.education}
            className={fieldClass("education")}
            placeholder="e.g. Diploma in Electrical Engineering"
          />
          {error("education")}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="languages" className="mb-2 block text-sm font-medium text-zinc-800">
            Languages
          </label>
          <input
            id="languages"
            name="languages"
            type="text"
            defaultValue={initialValues.languages.join(", ")}
            className={fieldClass("languages")}
            placeholder="Bangla, English"
          />
          <p className="mt-1.5 text-xs text-zinc-500">Separate languages with commas.</p>
          {error("languages")}
        </div>

        <div>
          <label htmlFor="budget" className="mb-2 block text-sm font-medium text-zinc-800">
            Migration budget
          </label>
          <select
            id="budget"
            name="budget"
            defaultValue={initialValues.budget}
            className={fieldClass("budget")}
          >
            <option value="">Not specified</option>
            {initialValues.budget && !budgets.includes(initialValues.budget) ? (
              <option value={initialValues.budget}>{initialValues.budget}</option>
            ) : null}
            {budgets.map((budget) => (
              <option key={budget} value={budget}>{budget}</option>
            ))}
          </select>
          {error("budget")}
        </div>

        <div>
          <label htmlFor="preferredRegion" className="mb-2 block text-sm font-medium text-zinc-800">
            Preferred region
          </label>
          <select
            id="preferredRegion"
            name="preferredRegion"
            defaultValue={initialValues.preferredRegion}
            className={fieldClass("preferredRegion")}
          >
            <option value="">No preference</option>
            {initialValues.preferredRegion && !regions.includes(initialValues.preferredRegion) ? (
              <option value={initialValues.preferredRegion}>{initialValues.preferredRegion}</option>
            ) : null}
            {regions.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          {error("preferredRegion")}
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {state.success}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end border-t border-zinc-200 pt-5">
        <SubmitButton />
      </div>
    </form>
  );
}
