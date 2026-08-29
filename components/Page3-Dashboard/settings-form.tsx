"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAccount } from "@/app/actions/settings";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

type SettingsUser = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
        checked ? "bg-emerald-600" : "bg-zinc-300",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        {description ? <p className="mt-0.5 text-xs text-zinc-500">{description}</p> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function SettingsForm({ user }: { user: SettingsUser }) {
  const [state, formAction] = useFormState(updateAccount, {});
  const [theme, setTheme] = React.useState<Theme>("system");
  const [notif, setNotif] = React.useState({ email: true, sms: false, product: true });
  const [twoFactor, setTwoFactor] = React.useState(false);

  React.useEffect(() => {
    const storedTheme = (localStorage.getItem("mw-theme") as Theme | null) ?? "system";
    setTheme(storedTheme);
    applyTheme(storedTheme);

    const rawNotif = localStorage.getItem("mw-notifications");
    if (rawNotif) {
      try {
        setNotif(JSON.parse(rawNotif));
      } catch {
        /* ignore */
      }
    }

    if (localStorage.getItem("mw-2fa") === "1") {
      setTwoFactor(true);
    }
  }, []);

  function applyTheme(value: Theme) {
    const root = document.documentElement;
    const dark =
      value === "dark" ||
      (value === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", dark);
  }

  function chooseTheme(value: Theme) {
    setTheme(value);
    localStorage.setItem("mw-theme", value);
    applyTheme(value);
  }

  function setNotifKey(key: keyof typeof notif, value: boolean) {
    const next = { ...notif, [key]: value };
    setNotif(next);
    localStorage.setItem("mw-notifications", JSON.stringify(next));
  }

  function toggleTwoFactor(value: boolean) {
    setTwoFactor(value);
    localStorage.setItem("mw-2fa", value ? "1" : "0");
  }

  const themes: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  return (
    <div className="mt-8 space-y-6">
      <Card
        title="Account"
        description="Update your personal details. Your email is used for sign-in."
      >
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" defaultValue={user.name ?? ""} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={user.phone ?? ""}
                placeholder="01712345678"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={user.email ?? ""}
              readOnly
              disabled
              className="bg-zinc-50 text-zinc-500"
            />
          </div>

          {state.error ? (
            <p className="text-sm font-medium text-red-600">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="text-sm font-medium text-emerald-700">{state.success}</p>
          ) : null}

          <div className="pt-1">
            <SubmitButton />
          </div>
        </form>
      </Card>

      <Card
        title="Appearance"
        description="Choose how the interface looks. System follows your device setting."
      >
        <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
          {themes.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => chooseTheme(option.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600",
                theme === option.value
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      <Card
        title="Notifications"
        description="Control which updates we send you. Saved on this device."
      >
        <div className="divide-y divide-zinc-100">
          <Row
            title="Email notifications"
            description="Account activity and migration reminders by email."
          >
            <Toggle
              checked={notif.email}
              onChange={(value) => setNotifKey("email", value)}
              label="Email notifications"
            />
          </Row>
          <Row
            title="SMS alerts"
            description="Important security and verification messages by SMS."
          >
            <Toggle
              checked={notif.sms}
              onChange={(value) => setNotifKey("sms", value)}
              label="SMS alerts"
            />
          </Row>
          <Row
            title="Product updates"
            description="New features and tips from Porizayi."
          >
            <Toggle
              checked={notif.product}
              onChange={(value) => setNotifKey("product", value)}
              label="Product updates"
            />
          </Row>
        </div>
      </Card>

      <Card
        title="Security"
        description="Protect your account with an extra verification step."
      >
        <div className="divide-y divide-zinc-100">
          <Row
            title="Two-factor authentication"
            description="Require a code in addition to your password at sign-in."
          >
            <Toggle
              checked={twoFactor}
              onChange={toggleTwoFactor}
              label="Two-factor authentication"
            />
          </Row>
        </div>
      </Card>
    </div>
  );
}
