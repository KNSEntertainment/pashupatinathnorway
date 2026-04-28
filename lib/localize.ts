import { LocalizedString } from "@/types";

type LocalizableField = Map<string, string> | Record<string, string> | LocalizedString | undefined;

export function localize(field: LocalizableField, locale: string, fallback = "en"): string {
	if (!field) return "";

	// Handle Map objects
	if (field instanceof Map) {
		return field.get(locale) || field.get(fallback) || "";
	}

	// Handle plain objects (from JSON/API responses) and LocalizedString
	const obj = field as Record<string, string>;
	return obj[locale] || obj[fallback] || "";
}
