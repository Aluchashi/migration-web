import type { Metadata } from "next";

import { PageTransition } from "@/components/Elements/page-transition";
import { Providers } from "@/components/Elements/providers";

import "./globals.css";
import { Lora, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";

const outfitHeading = Outfit({subsets:['latin'],variable:'--font-heading'});

const lora = Lora({subsets:['latin'],variable:'--font-serif'});

export const metadata: Metadata = {
  title: "Porizayi",
  description: "Migration planning workspace",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-serif", lora.variable, outfitHeading.variable)}>
      <body>
        <Providers>
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
