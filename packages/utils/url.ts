const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

export function toTrimmedString(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

export function toURL(value: string, base?: string | URL): URL | null {
	try {
		return new URL(value, base);
	} catch {
		return null;
	}
}

export function isHttpUrl(value: string): boolean {
	const url = toURL(value.trim());
	return url !== null && HTTP_PROTOCOLS.has(url.protocol) && url.hostname.length > 0;
}

export function normalizeHostname(hostname: string): string {
	return hostname
		.trim()
		.toLowerCase()
		.replace(/^www\./, "")
		.replace(/\.$/, "");
}

export function hostMatchesAny(hostname: string, allowedHosts: readonly string[]): boolean {
	const normalizedHostname = normalizeHostname(hostname);
	return allowedHosts.some((allowedHost) => {
		const normalizedAllowedHost = normalizeHostname(allowedHost);
		return (
			normalizedHostname === normalizedAllowedHost ||
			normalizedHostname.endsWith(`.${normalizedAllowedHost}`)
		);
	});
}
