import fs from "node:fs";
import path from "node:path";

const packageName = "FunctionKit";
const packageRoot = path.resolve(import.meta.dirname, "..");
const referenceRoot = path.join(packageRoot, "references");
const manifestPath = path.join(packageRoot, "publicApi.manifest.json");
const packageJsonPath = path.join(packageRoot, "package.json");
const failures = [];

function walk(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory()) return walk(absolute);
		return entry.name.endsWith(".md") ? [absolute] : [];
	});
}

function resolveCaseSensitive(absolutePath) {
	const normalized = path.resolve(absolutePath);
	const relative = path.relative(path.parse(normalized).root, normalized);
	let current = path.parse(normalized).root;
	for (const segment of relative.split(path.sep).filter(Boolean)) {
		if (!fs.existsSync(current) || !fs.statSync(current).isDirectory()) return false;
		if (!fs.readdirSync(current).includes(segment)) return false;
		current = path.join(current, segment);
	}
	return fs.existsSync(current);
}

function localMarkdownTargets(source) {
	return [...source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
		.map((match) => match[1])
		.filter((target) => !/^(?:https?:|mailto:|#)/.test(target));
}

const requiredSections = [
	"목적과 소유권",
	"Public API",
	"Runtime과 dependency",
	"동작 계약",
	"접근성",
	"오류와 cleanup",
	"예제",
	"금지 패턴",
	"검증",
];
const forbiddenBoilerplate = [
	"기존 본문의 사용법·signature 설명과 연결된 source/test가 현재 동작의 정본이다.",
	"이 reference가 가리키는 UIKit surface의 현재 구현 계약을 설명한다.",
	"이 reference가 가리키는 FunctionKit API의 제품 중립 동작을 설명한다.",
	"전용 contract test가 없다면 source/type/link 검증과 package typecheck/lint가 최소 검증 범위다.",
];

if (!fs.existsSync(referenceRoot)) failures.push(`${packageName}: references/ is missing`);
if (!fs.existsSync(manifestPath))
	failures.push(`${packageName}: publicApi.manifest.json is missing`);

const referenceFiles = fs.existsSync(referenceRoot)
	? walk(referenceRoot).filter((file) => !path.basename(file).startsWith("README"))
	: [];
const referenceSet = new Set(
	referenceFiles.map((file) => path.relative(packageRoot, file).replaceAll(path.sep, "/")),
);

for (const file of referenceFiles) {
	const relative = path.relative(packageRoot, file).replaceAll(path.sep, "/");
	const source = fs.readFileSync(file, "utf8");
	const h1s = source.match(/^#\s+.+$/gm) ?? [];
	if (h1s.length !== 1) failures.push(`${relative}: expected exactly one H1`);
	if (!/>\s*상태:\s*Reference/.test(source)) failures.push(`${relative}: missing Reference status`);
	if (!/>\s*Runtime:\s*[^\n]+/.test(source)) failures.push(`${relative}: missing Runtime metadata`);
	const isPublic = />\s*Public surface:\s*`[^`]+`/.test(source);
	const isInternal = />\s*Visibility:\s*Internal/.test(source);
	if (isPublic === isInternal)
		failures.push(`${relative}: use exactly one of Public surface or Internal visibility`);
	if (!/^\*\*Sources?:\*\*/m.test(source)) failures.push(`${relative}: missing Source evidence`);
	if (!/^\*\*Tests:\*\*/m.test(source)) failures.push(`${relative}: missing Tests evidence`);
	for (const section of requiredSections) {
		if (
			!new RegExp(`^##\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").test(source)
		) {
			failures.push(`${relative}: missing section ${section}`);
		}
	}
	for (const phrase of forbiddenBoilerplate) {
		if (source.includes(phrase)) failures.push(`${relative}: generic filler remains`);
	}
	if (source.includes(".agents/references"))
		failures.push(`${relative}: stale .agents/references path`);
	for (const target of localMarkdownTargets(source)) {
		const clean = target.split("#", 1)[0];
		if (!clean) continue;
		const absolute = path.resolve(path.dirname(file), clean);
		if (!resolveCaseSensitive(absolute)) failures.push(`${relative}: broken local link ${target}`);
	}
}

if (fs.existsSync(manifestPath)) {
	const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
	const entries = manifest.exports ?? [];
	const byReference = new Map();
	for (const entry of entries) {
		if (!entry.reference) continue;
		const bucket = byReference.get(entry.reference) ?? [];
		bucket.push(entry);
		byReference.set(entry.reference, bucket);
	}
	for (const entry of entries) {
		if (!entry.reference) {
			failures.push(`${packageName}: public export ${entry.name} has no reference`);
			continue;
		}
		const normalized = entry.reference.replace(/^\.\//, "");
		if (!referenceSet.has(normalized)) {
			failures.push(`${packageName}: ${entry.name} maps to missing reference ${entry.reference}`);
			continue;
		}
		const source = fs.readFileSync(path.join(packageRoot, normalized), "utf8");
		if (!/>\s*Public surface:\s*`[^`]+`/.test(source)) {
			failures.push(`${normalized}: mapped public export ${entry.name} is not marked public`);
		}
	}

	for (const [reference, mappedEntries] of byReference) {
		const referencePath = path.join(packageRoot, reference.replace(/^\.\//, ""));
		if (!fs.existsSync(referencePath)) continue;
		const source = fs.readFileSync(referencePath, "utf8");
		const runtime = source.match(/^> Runtime:\s*(.+)$/m)?.[1]?.trim();
		if (packageName === "UIKit") {
			if (runtime !== "Web-only")
				failures.push(
					`${reference}: UIKit reference runtime must be Web-only until a Native/shared implementation exists`,
				);
			continue;
		}
		const valueEntries = mappedEntries.filter((entry) => entry.kind === "value");
		const valueRuntimes = new Set(valueEntries.map((entry) => entry.runtime).filter(Boolean));
		const expectedRuntime = valueRuntimes.size > 1 ? "Mixed" : [...valueRuntimes][0];
		if (expectedRuntime && runtime !== expectedRuntime) {
			failures.push(
				`${reference}: Runtime ${runtime ?? "missing"} does not match manifest value runtime ${expectedRuntime}`,
			);
		}
		const surfaces = new Set(mappedEntries.flatMap((entry) => entry.surfaces ?? []));
		const publicSurface = source.match(/^> Public surface:\s*(.+)$/m)?.[1] ?? "";
		if (surfaces.has("shared") && !publicSurface.includes("/shared")) {
			failures.push(`${reference}: shared export is not documented on the shared public surface`);
		}
		if (!surfaces.has("shared") && surfaces.has("web") && !publicSurface.includes("/web")) {
			failures.push(`${reference}: Web export is not documented on the web public surface`);
		}
	}
}

if (fs.existsSync(packageJsonPath)) {
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
	const packageExports = packageJson.exports ?? {};
	if (packageName === "UIKit") {
		const webEntry = packageExports["./web"];
		const rootEntry = packageExports["."];
		if (!webEntry) {
			failures.push("UIKit: explicit ./web package export is missing");
		}
		if (rootEntry) {
			failures.push(
				"UIKit: package root export is forbidden; import the explicit /web or specialized subpath",
			);
		}
		const subpathReferences = new Map([
			["./styles", "references/styles/Importer.md"],
			["./dialog", "references/frameworks/Dialog.md"],
			["./code-box", "references/components/CodeBox.md"],
			["./osm", "references/components/Maps.md"],
		]);
		for (const [subpath, reference] of subpathReferences) {
			if (!packageExports[subpath]) {
				failures.push(`UIKit: package export ${subpath} is missing`);
				continue;
			}
			const referencePath = path.join(packageRoot, reference);
			if (!fs.existsSync(referencePath)) {
				failures.push(`UIKit: ${subpath} maps to missing reference ${reference}`);
				continue;
			}
			const referenceSource = fs.readFileSync(referencePath, "utf8");
			const expectedSurface = `@musecat/uikit/${subpath.slice(2)}`;
			const publicSurface = referenceSource.match(/^> Public surface:\s*(.+)$/m)?.[1] ?? "";
			if (!publicSurface.includes(expectedSurface)) {
				failures.push(
					`${reference}: package subpath ${expectedSurface} is not documented in Public surface metadata`,
				);
			}
		}
	} else {
		for (const subpath of ["./web"]) {
			if (!packageExports[subpath])
				failures.push(`FunctionKit: package export ${subpath} is missing`);
		}
	}
}

// A reference not used by the symbol manifest may only claim public visibility when it
// documents an explicit package subpath such as UIKit's stylesheet entry.
if (fs.existsSync(manifestPath)) {
	const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
	const mapped = new Set(
		(manifest.exports ?? [])
			.map((entry) => entry.reference)
			.filter(Boolean)
			.map((value) => value.replace(/^\.\//, "")),
	);
	const allowedUnmappedPublic =
		packageName === "UIKit" ? new Set(["references/styles/Importer.md"]) : new Set();
	for (const file of referenceFiles) {
		const reference = path.relative(packageRoot, file).replaceAll(path.sep, "/");
		const source = fs.readFileSync(file, "utf8");
		if (
			!mapped.has(reference) &&
			!allowedUnmappedPublic.has(reference) &&
			/>\s*Public surface:/.test(source)
		) {
			failures.push(
				`${reference}: unmapped reference must be Internal unless it documents an explicit package subpath`,
			);
		}
	}
}

if (failures.length) {
	console.error(
		`${packageName} reference audit failed (${failures.length} issue${failures.length === 1 ? "" : "s"}):`,
	);
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log(
	`${packageName} reference audit passed (${referenceFiles.length} reference documents).`,
);
