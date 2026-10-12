export type HasReadStateOptions = {
	readWhenValuesPresent?: Iterable<string | null | undefined>;
};

function parseReadStateValue(raw: string): unknown {
	try {
		return JSON.parse(raw) as unknown;
	} catch {
		try {
			return JSON.parse(decodeURIComponent(raw)) as unknown;
		} catch {
			return null;
		}
	}
}

export function parseReadState(raw: string | null): Set<string> {
	if (!raw) return new Set();

	const parsed = parseReadStateValue(raw);
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return new Set();

	return new Set(
		Object.entries(parsed)
			.filter(([, isRead]) => isRead === true)
			.map(([itemId]) => itemId),
	);
}

export function hasReadState(
	raw: string | null,
	itemId: string,
	options: HasReadStateOptions = {},
) {
	if (parseReadState(raw).has(itemId)) return true;

	return [...(options.readWhenValuesPresent ?? [])].some(
		(value) => typeof value === "string" && value.trim().length > 0,
	);
}

export function markReadState(raw: string | null, itemIds: Iterable<string>): string {
	const readItems = parseReadState(raw);

	for (const itemId of itemIds) {
		const normalizedItemId = itemId.trim();
		if (normalizedItemId) readItems.add(normalizedItemId);
	}

	return JSON.stringify(Object.fromEntries([...readItems].map((itemId) => [itemId, true])));
}
