import type { Metadata } from "next";

import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";

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
    <html lang="en">
      <body>
        <Navbar authenticated={Boolean(session?.user)} />
        {children}
      </body>
    </html>
  );
}
