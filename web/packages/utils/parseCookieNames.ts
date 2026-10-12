export function parseClientCookieNames(cookieString: string): string[] {
	return cookieString
		.split(";")
		.map((entry) => {
			const eqPos = entry.indexOf("=");
			return eqPos > -1 ? entry.slice(0, eqPos).trim() : entry.trim();
		})
		.filter(Boolean);
}
