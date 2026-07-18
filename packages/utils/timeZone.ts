import { type AppLocale, normalizeAppLocale, toIntlLocale } from "../datetime/dateTime.shared";

export type TimeZoneCityNames = Partial<Record<string, Partial<Record<AppLocale, string>>>>;

export function formatTimeZoneCityName(
	timeZone: string | null | undefined,
	locale?: string,
	cityNames?: TimeZoneCityNames,
): string | null {
	const normalized = timeZone?.trim();
	if (!normalized) return null;

	const localized = cityNames?.[normalized]?.[normalizeAppLocale(locale)];
	if (localized) return localized;

	return normalized.split("/").filter(Boolean).at(-1)?.replace(/_/g, " ").trim() || null;
}

export function formatTimeZoneDisplayName(
	timeZone: string | null | undefined,
	locale?: string,
	options?: { preferCityName?: boolean; cityNames?: TimeZoneCityNames; at?: Date },
): string | null {
	const normalized = timeZone?.trim();
	if (!normalized) return null;
	if (options?.preferCityName) return formatTimeZoneCityName(normalized, locale, options.cityNames);

	try {
		const name = new Intl.DateTimeFormat(toIntlLocale(locale), {
			timeZone: normalized,
			timeZoneName: "shortGeneric",
		})
			.formatToParts(options?.at ?? new Date())
			.find((part) => part.type === "timeZoneName")?.value;
		if (name && !/^GMT[+-]/.test(name)) return name;
	} catch {}

	return formatTimeZoneCityName(normalized, locale, options?.cityNames);
}

export function formatTimeZoneDisplayLabel({
	timeZone,
	locale,
	suffix,
	preferCityName = false,
	cityNames,
	at,
}: {
	timeZone: string | null | undefined;
	locale?: string;
	suffix?: string;
	preferCityName?: boolean;
	cityNames?: TimeZoneCityNames;
	at?: Date;
}): string | null {
	const name = formatTimeZoneDisplayName(timeZone, locale, { preferCityName, cityNames, at });
	const trimmedSuffix = suffix?.trim();
	if (!name || !trimmedSuffix) return name;
	if (name.toLocaleLowerCase().endsWith(trimmedSuffix.toLocaleLowerCase())) return name;
	return `${name}${normalizeAppLocale(locale) === "jp" ? "" : " "}${trimmedSuffix}`;
}
