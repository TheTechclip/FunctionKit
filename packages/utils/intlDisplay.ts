import { normalizeAppLocale, toIntlLocale } from "../datetime/dateTime";

const REGIONAL_INDICATOR_BASE = 0x1f1e6;
const ASCII_UPPERCASE_A = 65;
const UN_FLAG = "\u{1F1FA}\u{1F1F3}";
const REGION_DISPLAY_NAME_OVERRIDES = {
	HK: { en: "Hong Kong", jp: "香港", kr: "홍콩" },
	MO: { en: "Macau", jp: "マカオ", kr: "마카오" },
} as const;

function normalizeCode(value: string | null | undefined): string {
	return value?.trim().toUpperCase() ?? "";
}

function isAlpha2Code(value: string): boolean {
	return /^[A-Z]{2}$/.test(value);
}

function isCurrencyCode(value: string): boolean {
	return /^[A-Z]{3}$/.test(value);
}

export function formatRegionDisplayName(
	regionCode: string | null | undefined,
	locale?: string,
): string | null {
	const code = normalizeCode(regionCode);
	if (!isAlpha2Code(code)) return null;

	const override =
		REGION_DISPLAY_NAME_OVERRIDES[code as keyof typeof REGION_DISPLAY_NAME_OVERRIDES];
	if (override) return override[normalizeAppLocale(locale)];

	try {
		return new Intl.DisplayNames([toIntlLocale(locale)], { type: "region" }).of(code) ?? code;
	} catch {
		return code;
	}
}

export function formatRegionFlagEmoji(regionCode: string | null | undefined): string | null {
	const code = normalizeCode(regionCode);
	if (code === "UN") return UN_FLAG;
	if (!isAlpha2Code(code)) return null;

	return Array.from(code)
		.map((letter) =>
			String.fromCodePoint(REGIONAL_INDICATOR_BASE + letter.charCodeAt(0) - ASCII_UPPERCASE_A),
		)
		.join("");
}

export function formatRegionDisplayLabel({
	regionCode,
	locale,
	includeEmoji = false,
}: {
	regionCode: string | null | undefined;
	locale?: string;
	includeEmoji?: boolean;
}): string | null {
	const name = formatRegionDisplayName(regionCode, locale);
	if (!name) return null;
	if (!includeEmoji) return name;
	return `${formatRegionFlagEmoji(regionCode)} ${name}`;
}

export function formatCurrencyDisplayName(
	currencyCode: string | null | undefined,
	locale?: string,
): string | null {
	const code = normalizeCode(currencyCode);
	if (!isCurrencyCode(code)) return null;

	try {
		return new Intl.DisplayNames([toIntlLocale(locale)], { type: "currency" }).of(code) ?? code;
	} catch {
		return code;
	}
}
