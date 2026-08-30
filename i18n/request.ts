import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const locales = ["en", "bn"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieLocale = cookies().get("NEXT_LOCALE")?.value;
  const locale =
    (requestLocale && locales.includes(requestLocale as Locale)
      ? requestLocale
      : cookieLocale && locales.includes(cookieLocale as Locale)
        ? cookieLocale
        : defaultLocale) as string;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
