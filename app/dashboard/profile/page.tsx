import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile-form";
import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Profile | Migration Web",
};

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-7">
        <p className="text-sm font-medium text-emerald-700">Your profile</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">Career background</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Keep your work history and migration preferences current for more relevant recommendations.
        </p>
      </div>

      <ProfileForm
        initialValues={{
          currentJob: profile?.currentJob ?? "",
          yearsExperience: profile?.yearsExperience ?? null,
          skills: profile?.skills ?? [],
          education: profile?.education ?? "",
          languages: profile?.languages ?? [],
          budget: profile?.budget ?? "",
          preferredRegion: profile?.preferredRegion ?? "",
        }}
      />
    </main>
  );
}
