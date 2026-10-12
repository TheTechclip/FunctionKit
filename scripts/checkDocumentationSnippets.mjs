import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
function markdown(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const file = path.join(directory, entry.name);
		return entry.isDirectory() ? markdown(file) : entry.name.endsWith(".md") ? [file] : [];
	});
}
const files = [...markdown(path.join(root, "docs")), ...markdown(path.join(root, "references"))];
const temporary = fs.mkdtempSync(
	path.join(
		process.env.TMPDIR ?? (fs.existsSync("/tmp/opencode") ? "/tmp/opencode" : os.tmpdir()),
		"functionkit-snippets-",
	),
);
try {
	fs.symlinkSync(path.join(root, "node_modules"), path.join(temporary, "node_modules"), "dir");
	const names = [];
	const origins = new Map();
	for (const file of files) {
		const text = fs.readFileSync(file, "utf8");
		for (const match of text.matchAll(/^```(ts|tsx) check\r?\n([\s\S]*?)^```/gm)) {
			const name = path.join(temporary, `example-${names.length}.${match[1]}`);
			fs.writeFileSync(name, match[2]);
			names.push(name);
			origins.set(
				name,
				`${path.relative(root, file)}:${text.slice(0, match.index).split("\n").length}`,
			);
		}
	}
	if (!names.length) throw new Error("No checked documentation examples found");
	const config = path.join(temporary, "tsconfig.json");
	fs.writeFileSync(
		config,
		JSON.stringify(
			{
				compilerOptions: {
					target: "ES2022",
					module: "ESNext",
					moduleResolution: "Bundler",
					jsx: "react-jsx",
					strict: true,
					skipLibCheck: false,
					noEmit: true,
					esModuleInterop: true,
					paths: {
						"@musecat/functionkit": [path.join(root, "web/public.ts")],
						"@musecat/functionkit/web": [path.join(root, "web/public.ts")],
					},
				},
				files: names,
			},
			null,
			2,
		),
	);
	const result = spawnSync("bun", ["x", "tsc", "--project", config], {
		cwd: root,
		encoding: "utf8",
	});
	if (result.error) throw result.error;
	if (result.status !== 0) {
		let output = result.stdout + result.stderr;
		for (const [file, origin] of origins) output = output.replaceAll(file, origin);
		throw new Error(`Documentation typecheck failed:\n${output}`);
	}
	console.log(
		`Checked ${names.length} complete documentation examples against FunctionKit's public exports.`,
	);
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}
