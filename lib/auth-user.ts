import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getAuthenticatedUser() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });
}
