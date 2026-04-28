import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["en", "no", "ne"],
	defaultLocale: "en",
	localePrefix: "always", // URLs will always be /en/about, /no/about, etc
});
