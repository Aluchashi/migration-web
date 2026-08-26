import type { Metadata } from "next";

import { auth } from "@/auth";
import { Navbar } from "@/components/Elements/navbar";
import { PageTransition } from "@/components/Elements/page-transition";
import { Providers } from "@/components/Elements/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Migration Web",
  description: "Migration planning workspace",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar authenticated={Boolean(session?.user)} />
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
