import type { Metadata } from "next";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { PageTransition } from "@/components/Elements/page-transition";
import { Providers } from "@/components/Elements/providers";

import "./globals.css";
import { Lora, Outfit, Hind_Siliguri } from "next/font/google";
import { cn } from "@/lib/utils";

const outfitHeading = Outfit({subsets:['latin'],variable:'--font-heading'});

const lora = Lora({subsets:['latin'],variable:'--font-serif'});

const hindSiliguri = Hind_Siliguri({subsets:['bengali'],weight:['400','500','600','700'],variable:'--font-bengali'});

export const metadata: Metadata = {
  title: "Porizayi",
  description: "Migration planning workspace",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={cn("font-serif", lora.variable, outfitHeading.variable, hindSiliguri.variable)}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <PageTransition>{children}</PageTransition>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
