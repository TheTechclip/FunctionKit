import fs from "node:fs";
import path from "node:path";

const packageRoot = path.resolve(import.meta.dirname, "..");
const manifestPath = path.join(packageRoot, "publicApi.manifest.json");
const entryPaths = {
	root: path.join(packageRoot, "web", "public.ts"),
};

function parseExports(file, surface) {
	const sourceText = fs.readFileSync(file, "utf8");
	const exports = [];
	const pattern = /export\s+(type\s+)?\{([\s\S]*?)\}\s+from\s+"([^"]+)";/g;
	for (const match of sourceText.matchAll(pattern)) {
		const declarationTypeOnly = Boolean(match[1]);
		const source =
			"./" +
			path
				.relative(packageRoot, path.resolve(path.dirname(file), match[3]))
				.replaceAll(path.sep, "/");
		const specifiers = match[2]
			.replace(/\/\/.*$/gm, "")
			.split(",")
			.map((value) => value.trim())
			.filter(Boolean);
		for (const raw of specifiers) {
			const specifierTypeOnly = /^type\s+/.test(raw);
			const specifier = raw.replace(/^type\s+/, "").trim();
			const alias = /^(\S+)\s+as\s+(\S+)$/.exec(specifier);
			exports.push({
				name: alias?.[2] ?? specifier,
				importedName: alias?.[1] ?? specifier,
				kind: declarationTypeOnly || specifierTypeOnly ? "type" : "value",
				source,
				surface,
			});
		}
	}
	return exports;
}

function sourceFile(source) {
	const raw = path.join(packageRoot, source.replace(/^\.\//, ""));
	for (const candidate of [raw, `${raw}.ts`, `${raw}.tsx`]) {
		if (fs.existsSync(candidate)) return candidate;
	}
	return null;
}

function resolveReference(source) {
	const normalized = source.replace(/^\.\//, "").replace(/^web\//, "");
	const parts = normalized.split("/");
	if (parts[0] !== "packages") return null;
	if (parts[1] === "business") {
		const relative = parts.slice(2).join("/");
		if (relative === "dateTime/dateTime") return "references/business/dateTime/dateTime.shared.md";
		return `references/business/${relative}.md`;
	}
	if (parts[1] === "components") return `references/components/${parts[2]}.md`;
	if (parts[1] === "hooks") return `references/hooks/${parts[2]}.md`;
	if (parts[1] === "utils" && parts[2] === "browser") {
		const rawName = parts[3];
		const name =
			rawName === "clipboardShare.types"
				? "clipboardShare"
				: rawName === "cookie.client"
					? "cookie"
					: rawName;
		return `references/utils/browser/${name}.md`;
	}
	if (parts[1] === "utils" && parts[2] === "parseCookieNames") {
		return "references/utils/browser/cookie.md";
	}
	if (parts[1] === "utils") return `references/utils/${parts[2]}.md`;
	return null;
}

function normalizeReference(reference) {
	if (!reference) return null;
	if (fs.existsSync(path.join(packageRoot, reference))) return reference;
	// Cohesive runtime files share one contract when a dedicated runtime reference does not exist.
	const withoutRuntime = reference.replace(/\.(client|server)\.md$/, ".md");
	return fs.existsSync(path.join(packageRoot, withoutRuntime)) ? withoutRuntime : null;
}

function runtimeFor(source) {
	if (source.endsWith(".server")) return "Server-only";
	if (source.endsWith(".client")) return "Client-only";
	const file = sourceFile(source);
	const text = file ? fs.readFileSync(file, "utf8") : "";
	if (/^[\s\S]*?["']use client["'];/m.test(text)) return "Client-only";
	if (source.endsWith("/getDeviceInfo")) return "Guarded browser fallback";
	return "Universal";
}

const combined = new Map();
for (const [surface, entryPath] of Object.entries(entryPaths)) {
	for (const item of parseExports(entryPath, surface)) {
		const key = `${item.name}\0${item.source}`;
		const current = combined.get(key) ?? {
			name: item.name,
			importedName: item.importedName,
			kind: item.kind,
			source: item.source,
			runtime: runtimeFor(item.source),
			reference: normalizeReference(resolveReference(item.source)),
			surfaces: [],
		};
		if (!current.surfaces.includes(surface)) current.surfaces.push(surface);
		combined.set(key, current);
	}
}

const exports = [...combined.values()]
	.map((item) => ({
		...item,
		surfaces: item.surfaces.includes("root") ? [...item.surfaces, "web"] : item.surfaces,
	}))
	.sort((a, b) => a.name.localeCompare(b.name) || a.source.localeCompare(b.source));

const manifest = {
	schemaVersion: 1,
	generatedFrom: ["web/public.ts"],
	exports,
};
let serialized = JSON.stringify(manifest, null, "\t");
serialized = serialized.replace(
	/"generatedFrom": \[\n((?:\t\t"[^"]+"(?:,\n)?)+)\n\t\]/,
	(_match, body) =>
		`"generatedFrom": [${body
			.trim()
			.split(/,?\n/)
			.map((line) => line.trim())
			.join(", ")}]`,
);
serialized = serialized.replace(
	/"surfaces": \[\n((?:\t\t\t\t"[^"]+"(?:,\n)?)+)\n\t\t\t\]/g,
	(_match, body) =>
		`"surfaces": [${body
			.trim()
			.split(/,?\n/)
			.map((line) => line.trim())
			.join(", ")}]`,
);
serialized = `${serialized}\n`;
const check = process.argv.includes("--check");
if (check) {
	const current = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, "utf8") : "";
	if (current !== serialized) {
		console.error(
			"FunctionKit public API manifest is stale. Run `bun run functionkit:manifest` and commit the result.",
		);
		process.exit(1);
	}
	console.log(`FunctionKit public API manifest is current (${exports.length} exports).`);
} else {
	fs.writeFileSync(manifestPath, serialized);
	console.log(`Wrote publicApi.manifest.json (${exports.length} exports).`);
}
