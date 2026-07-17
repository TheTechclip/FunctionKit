import {
	type DateInput,
	type DatePreset,
	format24HourTime,
	formatDotDate,
	formatKoreanTime,
	formatLongDate,
	formatRelativeText,
	formatTwelveHourTime,
	type TimePreset,
	toDate,
} from "./dateTime.shared";

export function formatClientDate(
	value: DateInput,
	options: {
		locale?: string;
		timeZone?: string;
		preset: DatePreset;
	},
): string {
	const date = toDate(value);
	if (!date) return "";

	return options.preset === "dot"
		? formatDotDate(date, options.timeZone)
		: formatLongDate(date, options.locale, options.timeZone);
}

export function formatClientTime(
	value: DateInput,
	options: {
		locale?: string;
		timeZone?: string;
		preset: TimePreset;
	},
): string {
	const date = toDate(value);
	if (!date) return "";

	switch (options.preset) {
		case "ko":
			return formatKoreanTime(date, options.timeZone);
		case "12h":
			return formatTwelveHourTime(date, options.locale, options.timeZone);
		case "24h-second":
			return format24HourTime(date, {
				includeSeconds: true,
				timeZone: options.timeZone,
			});
		default:
			return format24HourTime(date, { timeZone: options.timeZone });
	}
}

export function formatClientDateTime(
	value: DateInput,
	options: {
		locale?: string;
		timeZone?: string;
		datePreset?: DatePreset;
		timePreset?: TimePreset;
	},
): string {
	const dateText = formatClientDate(value, {
		locale: options.locale,
		timeZone: options.timeZone,
		preset: options.datePreset ?? "long",
	});
	const timeText = formatClientTime(value, {
		locale: options.locale,
		timeZone: options.timeZone,
		preset: options.timePreset ?? "24h-minute",
	});
	return dateText && timeText ? `${dateText} ${timeText}` : dateText || timeText;
}

export function formatClientRelative(
	value: DateInput,
	options: {
		locale?: string;
		now?: DateInput;
		maxRelativeDays?: number;
		fallbackDatePreset?: DatePreset;
	},
): { text: string; isRelative: boolean } {
	const date = toDate(value);
	const now = toDate(options.now ?? Date.now());
	if (!date || !now) {
		return { text: "", isRelative: false };
	}

	const diffMs = Math.max(0, now.getTime() - date.getTime());
	const maxRelativeMs = (options.maxRelativeDays ?? 7) * 24 * 60 * 60 * 1000;
	if (diffMs > maxRelativeMs) {
		return {
			text: formatClientDate(date, {
				locale: options.locale,
				preset: options.fallbackDatePreset ?? "dot",
			}),
			isRelative: false,
		};
	}

	return formatRelativeText(diffMs, options.locale);
}
