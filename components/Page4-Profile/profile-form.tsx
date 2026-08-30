"use client";

import { useState, type KeyboardEvent } from "react";
import { useFormState, useFormStatus } from "react-dom";

import {
  BUDGETS,
  EDUCATION_LEVELS,
  FAMILY_STATUSES,
  INDUSTRIES,
  PROFICIENCY_LEVELS,
  REGION_OPTIONS,
  TIMELINES,
} from "@/lib/profile-options";
import { saveProfile, type ProfileActionState } from "@/app/actions/profile";
import { Dropdown } from "@/components/Elements/dropdown";

type WorkItem = {
  jobTitle: string;
  industry: string;
  employer: string;
  years: string;
  currentlyWorking: boolean;
  startDate: string;
  endDate: string;
  description: string;
};

type EducationItem = {
  level: string;
  field: string;
  institution: string;
  passingYear: string;
  result: string;
};

type LanguageItem = { name: string; proficiency: string };

type ProfileValues = {
  name: string;
  dateOfBirth: string;
  nid: string;
  phone: string;
  district: string;
  skills: string[];
  softSkills: string[];
  budget: string;
  preferredRegions: string[];
  timeline: string;
  familyStatus: string;
  workExperiences: WorkItem[];
  educationEntries: EducationItem[];
  languages: LanguageItem[];
};

type ProfileFormProps = { initialValues: ProfileValues };

const initialState: ProfileActionState = {};

function inputClass(error?: boolean) {
  return [
    "h-11 w-full rounded-xl border bg-white px-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-700 dark:placeholder:text-zinc-500",
    error
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-zinc-300 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:hover:border-zinc-600 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20",
  ].join(" ");
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function SectionHeading({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
      <div className="flex items-baseline gap-3">
        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{number}</span>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl dark:text-zinc-50">
          {title}
        </h2>
      </div>
      <p className="mt-1 pl-8 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
    </div>
  );
}

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const value = raw.trim().replace(/,+$/, "");
    if (!value) return;
    const key = value.toLocaleLowerCase();
    if (values.some((item) => item.toLocaleLowerCase() === key)) {
      setDraft("");
      return;
    }
    onChange([...values, value]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-2 py-1.5 transition-colors focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-within:border-emerald-500 dark:focus-within:ring-emerald-500/20">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 py-0.5 pl-2.5 pr-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          {value}
          <button
            type="button"
            aria-label={`Remove ${value}`}
            onClick={() => onChange(values.filter((_, i) => i !== index))}
            className="flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => add(draft)}
        placeholder={values.length === 0 ? placeholder : ""}
        className="h-7 min-w-32 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />
    </div>
  );
}

function EntryCard({
  title,
  onRemove,
  canRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  canRemove: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-zinc-200 bg-muted/50 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{title}</p>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${title}`}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-dashed border-zinc-300 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
    >
      + {label}
    </button>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400"
    >
      {pending ? "Saving..." : "Save profile"}
    </button>
  );
}

const emptyWork: WorkItem = {
  jobTitle: "",
  industry: "",
  employer: "",
  years: "",
  currentlyWorking: false,
  startDate: "",
  endDate: "",
  description: "",
};

const emptyEducation: EducationItem = {
  level: "",
  field: "",
  institution: "",
  passingYear: "",
  result: "",
};

const emptyLanguage: LanguageItem = { name: "", proficiency: "" };

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const [state, formAction] = useFormState(saveProfile, initialState);
  const [clientError, setClientError] = useState<string | null>(null);

  const [works, setWorks] = useState<WorkItem[]>(
    initialValues.workExperiences.length > 0 ? initialValues.workExperiences : [],
  );
  const [educations, setEducations] = useState<EducationItem[]>(initialValues.educationEntries);
  const [languages, setLanguages] = useState<LanguageItem[]>(initialValues.languages);
  const [skills, setSkills] = useState<string[]>(initialValues.skills);
  const [softSkills, setSoftSkills] = useState<string[]>(initialValues.softSkills);
  const [regions, setRegions] = useState<string[]>(initialValues.preferredRegions);

  function updateWork(index: number, patch: Partial<WorkItem>) {
    setWorks((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function updateEducation(index: number, patch: Partial<EducationItem>) {
    setEducations((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function updateLanguage(index: number, patch: Partial<LanguageItem>) {
    setLanguages((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function toggleRegion(region: string) {
    setRegions((current) =>
      current.includes(region)
        ? current.filter((item) => item !== region)
        : [...current, region],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setClientError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (name.length < 2) {
      event.preventDefault();
      setClientError("Full name is required (at least 2 characters).");
      return;
    }

    if (!/^(\+?880|0)1[3-9]\d{8}$/.test(phone.replace(/[\s()-]/g, ""))) {
      event.preventDefault();
      setClientError("A valid Bangladeshi mobile number is required (e.g. 01712345678).");
      return;
    }

    if (!educations.some((entry) => entry.level)) {
      event.preventDefault();
      setClientError("Add at least one education entry (degree or certificate).");
      return;
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
      <input type="hidden" name="skillsJson" value={JSON.stringify(skills)} />
      <input type="hidden" name="softSkillsJson" value={JSON.stringify(softSkills)} />
      <input type="hidden" name="preferredRegionsJson" value={JSON.stringify(regions)} />
      <input type="hidden" name="workExperienceJson" value={JSON.stringify(works)} />
      <input type="hidden" name="educationJson" value={JSON.stringify(educations)} />
      <input type="hidden" name="languagesJson" value={JSON.stringify(languages)} />

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <SectionHeading
          number="01"
          title="Personal Information"
          subtitle="Basic details that identify you and your background."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input
              type="text"
              name="name"
              defaultValue={initialValues.name}
              maxLength={80}
              required
              className={inputClass()}
              placeholder="As per national identity"
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              name="dateOfBirth"
              defaultValue={initialValues.dateOfBirth}
              min="1950-01-01"
              max="2010-12-31"
              className={inputClass()}
            />
          </Field>
          <Field label="Phone / WhatsApp">
            <input
              type="tel"
              name="phone"
              defaultValue={initialValues.phone}
              maxLength={20}
              required
              className={inputClass()}
              placeholder="01712345678"
            />
          </Field>
          <Field label="NID number" hint="Optional — 8 to 17 digits.">
            <input
              type="text"
              name="nid"
              inputMode="numeric"
              defaultValue={initialValues.nid}
              maxLength={17}
              className={inputClass()}
              placeholder="e.g. 1990123456789"
            />
          </Field>
          <Field label="Current district / city">
            <input
              type="text"
              name="district"
              defaultValue={initialValues.district}
              maxLength={80}
              className={inputClass()}
              placeholder="e.g. Dhaka, Chattogram"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <SectionHeading
          number="02"
          title="Work Experience"
          subtitle="Add each job you have held. Freshers can skip this section."
        />
        <div className="mt-6 space-y-4">
          {works.map((work, index) => (
            <EntryCard
              key={index}
              title={`Work experience ${index + 1}`}
              canRemove={works.length > 0}
              onRemove={() => setWorks((current) => current.filter((_, i) => i !== index))}
            >
              <Field label="Job title">
                <input
                  type="text"
                  value={work.jobTitle}
                  onChange={(event) => updateWork(index, { jobTitle: event.target.value })}
                  maxLength={120}
                  className={inputClass()}
                  placeholder="e.g. Construction helper"
                />
              </Field>
              <Field label="Industry / sector">
                <Dropdown
                  options={INDUSTRIES.map((industry) => ({ value: industry, label: industry }))}
                  value={work.industry}
                  onValueChange={(v) => updateWork(index, { industry: v })}
                  placeholder="Select industry"
                  title="Industry / sector"
                />
              </Field>
              <Field label="Employer / company" hint="Optional.">
                <input
                  type="text"
                  value={work.employer}
                  onChange={(event) => updateWork(index, { employer: event.target.value })}
                  maxLength={120}
                  className={inputClass()}
                  placeholder="e.g. ABC Constructions"
                />
              </Field>
              <Field label="Years in this role">
                <input
                  type="number"
                  value={work.years}
                  onChange={(event) => updateWork(index, { years: event.target.value })}
                  min={0}
                  max={60}
                  className={inputClass()}
                  placeholder="0"
                />
              </Field>
              <Field label="Start date (month & year)">
                <input
                  type="month"
                  value={work.startDate}
                  onChange={(event) => updateWork(index, { startDate: event.target.value })}
                  className={inputClass()}
                />
              </Field>
              <Field label="End date (month & year)">
                <input
                  type="month"
                  value={work.endDate}
                  onChange={(event) => updateWork(index, { endDate: event.target.value })}
                  disabled={work.currentlyWorking}
                  className={`${inputClass()} disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400`}
                />
              </Field>
              <label className="flex items-center gap-2.5 text-sm text-zinc-700 sm:col-span-2 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={work.currentlyWorking}
                  onChange={(event) =>
                    updateWork(index, {
                      currentlyWorking: event.target.checked,
                      endDate: event.target.checked ? "" : work.endDate,
                    })
                  }
                  className="h-4 w-4 rounded border-zinc-300 accent-emerald-600 dark:border-zinc-600 dark:accent-emerald-500"
                />
                Currently working here
              </label>
              <div className="sm:col-span-2">
                <Field
                  label="Brief job description"
                  hint="2-3 lines about daily duties — helps AI understand your real skills."
                >
                  <textarea
                    value={work.description}
                    onChange={(event) => updateWork(index, { description: event.target.value })}
                    maxLength={1000}
                    rows={3}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                    placeholder="e.g. Mixing cement, assisting masons, carrying materials, following site safety rules."
                  />
                </Field>
              </div>
            </EntryCard>
          ))}
          <AddButton
            label="Add another work experience"
            onClick={() => setWorks((current) => [...current, { ...emptyWork }])}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <SectionHeading
          number="03"
          title="Education"
          subtitle="At least one degree or certificate is required."
        />
        <div className="mt-6 space-y-4">
          {educations.map((education, index) => (
            <EntryCard
              key={index}
              title={`Education ${index + 1}`}
              canRemove={educations.length > 1}
              onRemove={() => setEducations((current) => current.filter((_, i) => i !== index))}
            >
              <Field label="Degree / certificate level">
                <Dropdown
                  options={EDUCATION_LEVELS.map((level) => ({ value: level, label: level }))}
                  value={education.level}
                  onValueChange={(v) => updateEducation(index, { level: v })}
                  placeholder="Select level"
                  title="Degree / certificate level"
                />
              </Field>
              <Field label="Field of study / trade" hint="Optional — e.g. Electrical, Business Studies.">
                <input
                  type="text"
                  value={education.field}
                  onChange={(event) => updateEducation(index, { field: event.target.value })}
                  maxLength={120}
                  className={inputClass()}
                  placeholder="e.g. Electrical"
                />
              </Field>
              <Field label="Institution name">
                <input
                  type="text"
                  value={education.institution}
                  onChange={(event) => updateEducation(index, { institution: event.target.value })}
                  maxLength={160}
                  className={inputClass()}
                  placeholder="e.g. Dhaka Polytechnic Institute"
                />
              </Field>
              <Field label="Passing year">
                <input
                  type="number"
                  value={education.passingYear}
                  onChange={(event) => updateEducation(index, { passingYear: event.target.value })}
                  min={1970}
                  max={2030}
                  className={inputClass()}
                  placeholder="e.g. 2020"
                />
              </Field>
              <Field label="Result / grade" hint="Optional.">
                <input
                  type="text"
                  value={education.result}
                  onChange={(event) => updateEducation(index, { result: event.target.value })}
                  maxLength={60}
                  className={inputClass()}
                  placeholder="e.g. GPA 4.50"
                />
              </Field>
            </EntryCard>
          ))}
          <AddButton
            label="Add another degree / certificate"
            onClick={() => setEducations((current) => [...current, { ...emptyEducation }])}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <SectionHeading
          number="04"
          title="Skills"
          subtitle="Type a skill and press Enter. Click x to remove."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Technical / vocational skills">
            <TagInput values={skills} onChange={setSkills} placeholder="e.g. Welding, Excel, Sewing" />
          </Field>
          <Field label="Soft skills" hint="Optional.">
            <TagInput
              values={softSkills}
              onChange={setSoftSkills}
              placeholder="e.g. Teamwork, Communication"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <SectionHeading
          number="05"
          title="Languages"
          subtitle="Include a proficiency level for each language."
        />
        <div className="mt-6 space-y-4">
          {languages.map((language, index) => (
            <EntryCard
              key={index}
              title={`Language ${index + 1}`}
              canRemove={languages.length > 0}
              onRemove={() => setLanguages((current) => current.filter((_, i) => i !== index))}
            >
              <Field label="Language">
                <input
                  type="text"
                  value={language.name}
                  onChange={(event) => updateLanguage(index, { name: event.target.value })}
                  maxLength={40}
                  list="language-suggestions"
                  className={inputClass()}
                  placeholder="e.g. English, Arabic"
                />
              </Field>
              <Field label="Proficiency level">
                <Dropdown
                  options={PROFICIENCY_LEVELS.map((level) => ({ value: level, label: level }))}
                  value={language.proficiency}
                  onValueChange={(v) => updateLanguage(index, { proficiency: v })}
                  placeholder="Select level"
                  title="Proficiency level"
                />
              </Field>
            </EntryCard>
          ))}
          <datalist id="language-suggestions">
            {["Bengali", "English", "Arabic", "Hindi", "Urdu", "Malay"].map((language) => (
              <option key={language} value={language} />
            ))}
          </datalist>
          <AddButton
            label="Add another language"
            onClick={() => setLanguages((current) => [...current, { ...emptyLanguage }])}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <SectionHeading
          number="06"
          title="Migration Preferences"
          subtitle="Where you want to go, and when."
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Preferred countries / regions" hint="Select all that apply.">
              <div className="flex flex-wrap gap-2">
                {REGION_OPTIONS.map((region) => {
                  const active = regions.includes(region);
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => toggleRegion(region)}
                      aria-pressed={active}
                      className={[
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        active
                       ? "border-emerald-600 bg-emerald-600 text-white"
                       : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100",
                      ].join(" ")}
                    >
                      {region}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
          <Field label="Budget range">
            <Dropdown
              name="budget"
              defaultValue={initialValues.budget}
              options={[
                { value: "", label: "Not specified" },
                ...(initialValues.budget && !BUDGETS.includes(initialValues.budget)
                  ? [{ value: initialValues.budget, label: initialValues.budget }]
                  : []),
                ...BUDGETS.map((budget) => ({ value: budget, label: budget })),
              ]}
              placeholder="Not specified"
              title="Budget range"
            />
          </Field>
          <Field label="Timeline / urgency">
            <Dropdown
              name="timeline"
              defaultValue={initialValues.timeline}
              options={[
                { value: "", label: "Not specified" },
                ...(initialValues.timeline && !TIMELINES.includes(initialValues.timeline)
                  ? [{ value: initialValues.timeline, label: initialValues.timeline }]
                  : []),
                ...TIMELINES.map((timeline) => ({ value: timeline, label: timeline })),
              ]}
              placeholder="Not specified"
              title="Timeline / urgency"
            />
          </Field>
          <Field label="Family status" hint="Optional.">
            <Dropdown
              name="familyStatus"
              defaultValue={initialValues.familyStatus}
              options={[
                { value: "", label: "Not specified" },
                ...(initialValues.familyStatus && !FAMILY_STATUSES.includes(initialValues.familyStatus)
                  ? [{ value: initialValues.familyStatus, label: initialValues.familyStatus }]
                  : []),
                ...FAMILY_STATUSES.map((status) => ({ value: status, label: status })),
              ]}
              placeholder="Not specified"
              title="Family status"
            />
          </Field>
        </div>
      </section>

      <div className="sticky bottom-4 z-10">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-lg shadow-zinc-900/5 backdrop-blur">
          <div className="min-w-0">
            {clientError ? (
              <p role="alert" className="truncate text-sm font-medium text-red-600">
                {clientError}
              </p>
            ) : state.error ? (
              <p role="alert" className="truncate text-sm font-medium text-red-600">
                {state.error}
              </p>
            ) : state.success ? (
              <p role="status" className="truncate text-sm font-medium text-emerald-700">
                {state.success}
              </p>
            ) : (
              <p className="truncate text-sm text-zinc-500">
                Check everything before saving — entries are replaced on each save.
              </p>
            )}
          </div>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
