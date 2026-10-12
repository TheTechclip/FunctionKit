import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { prepareRelease } from "./release.mjs";

const packageRoot = path.resolve(import.meta.dirname, "..");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "functionkit-smoke-"));
const stage = path.join(tempRoot, "package");
const consumer = path.join(tempRoot, "consumer");

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		stdio: "inherit",
		...options,
	});
	if (result.status !== 0) {
		throw new Error(`${command} ${args.join(" ")} failed`);
	}
}

try {
	prepareRelease({ profileName: "web", output: stage, packageRoot });
	run("bun", ["pm", "pack"], { cwd: stage });
	const archive = fs.readdirSync(stage).find((file) => file.endsWith(".tgz"));
	if (!archive) throw new Error("Packed Web archive was not created");

	fs.mkdirSync(consumer);
	fs.writeFileSync(
		path.join(consumer, "package.json"),
		`${JSON.stringify(
			{
				private: true,
				type: "module",
				dependencies: {
					"@musecat/functionkit": `file:${path.join(stage, archive)}`,
					react: "19.3.0",
					"react-dom": "19.3.0",
				},
				devDependencies: {
					"@types/react": "^19.3.0",
					"@types/react-dom": "^19.3.0",
					typescript: "^7.0.2",
				},
			},
			null,
			2,
		)}\n`,
	);
	fs.writeFileSync(
		path.join(consumer, "smoke.mjs"),
		`import { debounce, isHttpUrl } from "@musecat/functionkit";\nif (typeof debounce !== "function" || !isHttpUrl("https://example.com")) process.exit(1);\n`,
	);
	fs.writeFileSync(
		path.join(consumer, "types.tsx"),
		`import { useDebounce, type NavigatorShareResult } from "@musecat/functionkit";\nexport function Example({ onValue }: { onValue: (value: string) => void }) { const emit = useDebounce(onValue, 10); return <button onClick={() => emit("next")}>Run</button>; }\nconst result: NavigatorShareResult | null = null; void result;\n`,
	);
	fs.writeFileSync(
		path.join(consumer, "tsconfig.json"),
		`${JSON.stringify(
			{
				compilerOptions: {
					target: "ES2022",
					module: "ESNext",
					moduleResolution: "Bundler",
					jsx: "react-jsx",
					strict: true,
					noEmit: true,
					skipLibCheck: false,
				},
				include: ["types.tsx"],
			},
			null,
			2,
		)}\n`,
	);

	run("bun", ["install"], { cwd: consumer });
	run("bun", ["smoke.mjs"], { cwd: consumer });
	const nodeAvailable = spawnSync("node", ["--version"], { stdio: "ignore" }).status === 0;
	if (nodeAvailable) run("node", ["smoke.mjs"], { cwd: consumer });
	run("bun", ["x", "tsc", "--project", "tsconfig.json"], { cwd: consumer });
	const bundlerConfig = JSON.parse(fs.readFileSync(path.join(consumer, "tsconfig.json"), "utf8"));
	fs.writeFileSync(
		path.join(consumer, "tsconfig.nodenext.json"),
		JSON.stringify(
			{
				...bundlerConfig,
				compilerOptions: {
					...bundlerConfig.compilerOptions,
					module: "NodeNext",
					moduleResolution: "NodeNext",
				},
			},
			null,
			2,
		),
	);
	run("bun", ["x", "tsc", "--project", "tsconfig.nodenext.json"], { cwd: consumer });
	console.log("FunctionKit Web packed-install smoke test passed.");
} finally {
	fs.rmSync(tempRoot, { recursive: true, force: true });
}
