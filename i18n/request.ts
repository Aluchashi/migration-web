import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const locales = ["en", "bn"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

function isLocale(value: string | undefined): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const resolvedRequestLocale = await requestLocale;
  const cookieLocale = cookies().get("NEXT_LOCALE")?.value;

  const locale: Locale = isLocale(resolvedRequestLocale)
    ? resolvedRequestLocale
    : isLocale(cookieLocale)
      ? cookieLocale
      : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});