import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const packageRoot = path.resolve(import.meta.dirname, "..");

function walk(relative) {
	const absolute = path.join(packageRoot, relative);
	if (!fs.existsSync(absolute)) return [];
	const stat = fs.statSync(absolute);
	if (stat.isFile()) return [relative];
	return fs
		.readdirSync(absolute, { withFileTypes: true })
		.flatMap((entry) => walk(path.join(relative, entry.name)));
}

function isPublicTest(relative) {
	if (!/\.test\.(?:ts|tsx)$/.test(relative)) return false;
	const source = fs.readFileSync(path.join(packageRoot, relative), "utf8");
	return !/(?:from\s+|import\(\s*)["'][^"']*web\/musecat(?:\/|["'])/.test(source);
}

const files = [
	"package.json",
	"releaseProfiles.json",
	"tsconfig.json",
	"vitest.config.ts",
	...walk("scripts").filter(
		(file) => file.endsWith(".mjs") && path.basename(file) !== "exportPublicRepository.mjs",
	),
	...walk("web/packages").filter((file) => /\.(?:ts|tsx)$/.test(file)),
	"web/public.ts",
	...walk("tests").filter(isPublicTest),
];

const result = spawnSync("bunx", ["biome", "check", ...files], {
	cwd: packageRoot,
	stdio: "inherit",
});

process.exit(result.status ?? 1);
