"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAccount } from "@/app/actions/settings";
import { cn } from "@/lib/utils";

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
  const t = useTranslations("Dashboard.settings");
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t("saving") : t("save")}
    </Button>
  );
}

export function SettingsForm({ user }: { user: SettingsUser }) {
  const t = useTranslations("Dashboard.settings");
  const [state, formAction] = useFormState(updateAccount, {});
  const [notif, setNotif] = React.useState({ email: true, sms: false, product: true });
  const [twoFactor, setTwoFactor] = React.useState(false);

  React.useEffect(() => {
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

  function setNotifKey(key: keyof typeof notif, value: boolean) {
    const next = { ...notif, [key]: value };
    setNotif(next);
    localStorage.setItem("mw-notifications", JSON.stringify(next));
  }

  function toggleTwoFactor(value: boolean) {
    setTwoFactor(value);
    localStorage.setItem("mw-2fa", value ? "1" : "0");
  }

  return (
    <div className="mt-8 space-y-6">
      <Card title={t("account")} description={t("accountDesc")}>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("fullName")}</Label>
              <Input id="name" name="name" defaultValue={user.name ?? ""} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("phone")}</Label>
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
            <Label htmlFor="email">{t("email")}</Label>
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

      <Card title={t("notifications")} description={t("notificationsDesc")}>
        <div className="divide-y divide-zinc-100">
          <Row
            title={t("emailNotif")}
            description={t("emailNotifDesc")}
          >
            <Toggle
              checked={notif.email}
              onChange={(value) => setNotifKey("email", value)}
              label={t("emailNotif")}
            />
          </Row>
          <Row
            title={t("smsAlerts")}
            description={t("smsAlertsDesc")}
          >
            <Toggle
              checked={notif.sms}
              onChange={(value) => setNotifKey("sms", value)}
              label={t("smsAlerts")}
            />
          </Row>
          <Row
            title={t("productUpdates")}
            description={t("productUpdatesDesc")}
          >
            <Toggle
              checked={notif.product}
              onChange={(value) => setNotifKey("product", value)}
              label={t("productUpdates")}
            />
          </Row>
        </div>
      </Card>

      <Card
        title={t("security")}
        description={t("securityDesc")}
      >
        <div className="divide-y divide-zinc-100">
          <Row
            title={t("twoFactor")}
            description={t("twoFactorDesc")}
          >
            <Toggle
              checked={twoFactor}
              onChange={toggleTwoFactor}
              label={t("twoFactor")}
            />
          </Row>
        </div>
      </Card>
    </div>
  );
}
