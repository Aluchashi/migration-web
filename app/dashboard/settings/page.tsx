import { getAuthenticatedUser } from "@/lib/auth-user";

import { SettingsForm } from "@/components/Page3-Dashboard/settings-form";

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-sm font-medium text-emerald-700">Settings</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">
        Settings
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-600">
        Manage your account details, appearance, and notification preferences.
      </p>
      <SettingsForm
        user={{ name: user?.name, email: user?.email, phone: user?.phone }}
      />
    </div>
  );
}
