import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";

const defaultPackageRoot = path.resolve(import.meta.dirname, "..");
const repoRoot = defaultPackageRoot;
function parseSource(file, source) {
	return parse(source, {
		sourceType: "module",
		plugins: ["typescript", ...(file.endsWith(".tsx") ? ["jsx"] : [])],
	}).program;
}

function inside(root, relative) {
	const absolute = path.resolve(root, relative);
	if (absolute === root || !absolute.startsWith(`${root}${path.sep}`)) {
		throw new Error(`Path escapes package boundary: ${relative}`);
	}
	return absolute;
}

function dependencyGraph(packageRoot, entries, allowedSourceRoots) {
	const visited = new Set();
	const external = new Set();
	function visit(relative, isEntry = false) {
		if (visited.has(relative)) return;
		const absolute = inside(packageRoot, relative);
		if (!isEntry && !allowedSourceRoots.some((root) => relative.startsWith(`${root}/`))) {
			throw new Error(`Source is outside selected platform: ${relative}`);
		}
		if (fs.lstatSync(absolute).isSymbolicLink())
			throw new Error(`Release cannot include symlinks: ${relative}`);
		if (!fs.statSync(absolute).isFile()) throw new Error(`Not a source file: ${relative}`);
		visited.add(relative);
		const source = parseSource(relative, fs.readFileSync(absolute, "utf8"));
		function dependency(specifier) {
			if (!specifier.startsWith(".")) {
				external.add(specifier);
				return;
			}
			const base = path.resolve(path.dirname(absolute), specifier);
			const file = [base, `${base}.ts`, `${base}.tsx`].find(
				(candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
			);
			if (!file) throw new Error(`Unresolved dependency ${specifier} in ${relative}`);
			visit(path.relative(packageRoot, file).replaceAll(path.sep, "/"));
		}
		function walk(node) {
			if (
				["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"].includes(
					node.type,
				) &&
				node.source
			) {
				dependency(node.source.value);
			}
			if (node.type === "TSImportType") dependency(node.argument.value);
			if (node.type === "ImportExpression") {
				if (node.source.type !== "StringLiteral")
					throw new Error(`Nonliteral dependency in ${relative}`);
				dependency(node.source.value);
			}
			if (
				node.type === "CallExpression" &&
				(node.callee.type === "Import" ||
					(node.callee.type === "Identifier" && node.callee.name === "require"))
			) {
				if (node.arguments.length !== 1 || node.arguments[0].type !== "StringLiteral")
					throw new Error(`Nonliteral dependency in ${relative}`);
				dependency(node.arguments[0].value);
			}
			for (const value of Object.values(node)) {
				if (Array.isArray(value)) {
					for (const child of value) if (child?.type) walk(child);
				} else if (value?.type) walk(value);
			}
		}
		walk(source);
	}
	for (const entry of entries) visit(entry.replace(/^\.\//, ""), true);
	return { files: visited, external };
}

function publicInventory(packageRoot, profile) {
	const manifest = JSON.parse(
		fs.readFileSync(path.join(packageRoot, "publicApi.manifest.json"), "utf8"),
	);
	const selected = new Map();
	for (const [subpath, entry] of Object.entries(profile.exports)) {
		const surface = subpath === "." ? "root" : subpath.slice(2);
		const absolute = inside(packageRoot, entry);
		const source = parseSource(entry, fs.readFileSync(absolute, "utf8"));
		for (const statement of source.body) {
			if (statement.type !== "ExportNamedDeclaration")
				throw new Error(`Public entry must contain explicit named re-exports: ${entry}`);
			if (
				!statement.source ||
				statement.declaration ||
				statement.specifiers.some((item) => item.type !== "ExportSpecifier")
			) {
				throw new Error(`Wildcard or local exports are unsupported in release entry: ${entry}`);
			}
			const origin =
				"./" +
				path
					.relative(packageRoot, path.resolve(path.dirname(absolute), statement.source.value))
					.replaceAll(path.sep, "/");
			for (const specifier of statement.specifiers) {
				const name = specifier.exported.name;
				const item = manifest.exports.find(
					(candidate) => candidate.name === name && candidate.source === origin,
				);
				if (!item?.reference)
					throw new Error(
						`Export ${name} has no current manifest/reference; regenerate the API manifest`,
					);
				const key = `${name}\0${origin}`;
				const current = selected.get(key) ?? { ...item, surfaces: [] };
				if (!current.surfaces.includes(surface)) current.surfaces.push(surface);
				selected.set(key, current);
			}
		}
	}
	return {
		...manifest,
		generatedFrom: [...new Set(Object.values(profile.exports))],
		exports: [...selected.values()],
	};
}

function compileWebRelease(packageRoot, destination, graph, profile) {
	const tempRoot = path.join(packageRoot, ".tmp");
	fs.mkdirSync(tempRoot, { recursive: true });
	const tsconfigPath = path.join(tempRoot, `tsconfig.release.${process.pid}.json`);
	const outDir = path.join(destination, "dist");
	const config = {
		compilerOptions: {
			target: "ES2022",
			lib: ["DOM", "DOM.Iterable", "ES2022"],
			module: "ESNext",
			moduleResolution: "Bundler",
			jsx: "react-jsx",
			declaration: true,
			declarationMap: false,
			sourceMap: true,
			noEmit: false,
			rootDir: packageRoot,
			outDir,
			strict: true,
			skipLibCheck: true,
			esModuleInterop: true,
			isolatedModules: true,
			resolveJsonModule: true,
		},
		files: [...graph.files].map((relative) => path.join(packageRoot, relative)),
	};
	fs.writeFileSync(tsconfigPath, `${JSON.stringify(config, null, 2)}\n`);
	const run = spawnSync("bun", ["x", "tsc", "--project", tsconfigPath], {
		cwd: defaultPackageRoot,
		stdio: "inherit",
	});
	fs.rmSync(tsconfigPath, { force: true });
	if (run.status !== 0) throw new Error("Failed to compile the Web release");

	const rewriteRelativeSpecifiers = (directory) => {
		for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
			const absolute = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				rewriteRelativeSpecifiers(absolute);
				continue;
			}
			if (!entry.name.endsWith(".js") && !entry.name.endsWith(".d.ts")) continue;
			let source = fs.readFileSync(absolute, "utf8");
			const withExtension = (specifier) =>
				/\.(?:js|mjs|cjs|json)$/.test(specifier) ? specifier : `${specifier}.js`;
			source = source.replace(
				/(\bfrom\s+["'])(\.{1,2}\/[^"']+)(["'])/g,
				(_match, before, specifier, after) => `${before}${withExtension(specifier)}${after}`,
			);
			source = source.replace(
				/(\bimport\s*\(\s*["'])(\.{1,2}\/[^"']+)(["']\s*\))/g,
				(_match, before, specifier, after) => `${before}${withExtension(specifier)}${after}`,
			);
			fs.writeFileSync(absolute, source);
		}
	};
	rewriteRelativeSpecifiers(outDir);

	const exports = Object.fromEntries(
		Object.entries(profile.exports).map(([subpath, entry]) => {
			const emitted = entry.replace(/^\.\//, "").replace(/\.(?:ts|tsx)$/, "");
			return [
				subpath,
				{
					types: `./dist/${emitted}.d.ts`,
					import: `./dist/${emitted}.js`,
					default: `./dist/${emitted}.js`,
				},
			];
		}),
	);

	return exports;
}

/** @param {{ profileName?: string, output?: string, packageRoot?: string }} options */
export function prepareRelease({ profileName = "web", output, packageRoot = defaultPackageRoot }) {
	const profiles = JSON.parse(
		fs.readFileSync(path.join(packageRoot, "releaseProfiles.json"), "utf8"),
	);
	const profile = profiles.profiles[profileName];
	if (!profile) throw new Error(`Unknown release profile: ${profileName}`);
	const original = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));
	// Resolve and validate the complete graph before creating an output directory.
	const graph =
		profile.format === "npm"
			? dependencyGraph(packageRoot, Object.values(profile.exports), profile.allowedSourceRoots)
			: null;
	if (graph) {
		for (const dependency of graph.external) {
			const name = dependency.startsWith("@")
				? dependency.split("/").slice(0, 2).join("/")
				: dependency.split("/")[0];
			if (!profile.peerDependencies.includes(name) && !original.dependencies?.[name])
				throw new Error(`Undeclared release dependency: ${dependency}`);
		}
	}
	const inventory = graph ? publicInventory(packageRoot, profile) : null;
	let destination;
	if (output) {
		destination = path.resolve(output);
		if (
			destination === packageRoot ||
			packageRoot.startsWith(`${destination}${path.sep}`) ||
			destination.startsWith(`${packageRoot}${path.sep}`)
		) {
			throw new Error("Release output must be outside the source package");
		}
		fs.mkdirSync(destination, { recursive: false }); // Never overwrite an existing directory.
	} else {
		const parent = path.join(repoRoot, ".tmp", "functionkit-release");
		fs.mkdirSync(parent, { recursive: true });
		destination = fs.mkdtempSync(path.join(parent, `${profileName}-`));
	}
	const copied = new Set();
	function copy(relative, target = relative) {
		const source = inside(packageRoot, relative);
		const dest = inside(destination, target);
		fs.mkdirSync(path.dirname(dest), { recursive: true });
		if (fs.lstatSync(source).isSymbolicLink())
			throw new Error(`Release cannot include symlinks: ${relative}`);
		if (fs.statSync(source).isDirectory()) {
			for (const entry of fs.readdirSync(source))
				copy(`${relative}/${entry}`, `${target}/${entry}`);
		} else {
			fs.copyFileSync(source, dest);
			copied.add(target);
		}
	}
	copy("LICENSE");
	if (!graph) {
		for (const file of profile.files) copy(`${profile.sourceRoot}/${file}`, file);
	} else {
		for (const file of graph.files) copy(file);
		const entries = inventory.exports;
		for (const reference of new Set(entries.map((item) => item.reference))) {
			if (!reference)
				throw new Error("Release export has no reference; regenerate the API manifest");
			copy(reference);
		}
		for (const file of [
			"README.md",
			"README.ko.md",
			"CHANGELOG.md",
			"CONTRIBUTING.md",
			"CONTRIBUTING.ko.md",
			"SECURITY.md",
		]) {
			if (fs.existsSync(path.join(packageRoot, file))) copy(file);
		}
		if (fs.existsSync(path.join(packageRoot, "docs"))) copy("docs");
		fs.writeFileSync(
			path.join(destination, "publicApi.manifest.json"),
			`${JSON.stringify(inventory, null, 2)}\n`,
		);
		// Published references retain useful evidence but must not link to private tests or monorepo docs.
		for (const file of copied) {
			if (!file.endsWith(".md")) continue;
			const absolute = path.join(destination, file);
			let text = fs.readFileSync(absolute, "utf8");
			text = text.replace(
				/^> Public surface:.*$/m,
				`> Public surface: \`${Object.keys(profile.exports)
					.map((key) => (key === "." ? profile.name : profile.name + key.slice(1)))
					.join(", ")}\``,
			);
			text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, target) => {
				if (/^(https?:|mailto:|#)/.test(target)) return match;
				const resolved = path.resolve(path.dirname(absolute), target.split("#")[0]);
				return resolved.startsWith(`${destination}${path.sep}`) && fs.existsSync(resolved)
					? match
					: label;
			});
			text = text.replace(/@musecat\/functionkit(?:\/(shared|web))?/g, (_match, subpath) => {
				const publicPath = subpath && profile.exports[`./${subpath}`] ? `/${subpath}` : "";
				return `${profile.name}${publicPath}`;
			});
			fs.writeFileSync(absolute, text);
		}
		const peers = Object.fromEntries(
			profile.peerDependencies.map((name) => [name, original.peerDependencies[name]]),
		);
		const dependencies = Object.fromEntries(
			Object.entries(original.dependencies ?? {}).filter(([name]) =>
				[...graph.external].some((dep) => dep === name || dep.startsWith(`${name}/`)),
			),
		);
		const builtExports = compileWebRelease(packageRoot, destination, graph, profile);
		const rootExport = builtExports["."];
		const packageJson = {
			name: profile.name,
			version: original.version,
			description: profile.description,
			license: original.license,
			author: original.author,
			keywords: original.keywords,
			engines: original.engines,
			repository: original.repository,
			bugs: original.bugs,
			homepage: original.homepage,
			type: "module",
			private: false,
			sideEffects: original.sideEffects,
			main: rootExport.import,
			module: rootExport.import,
			types: rootExport.types,
			exports: builtExports,
			files: ["dist", ...copied, "publicApi.manifest.json"],
			...(Object.keys(peers).length ? { peerDependencies: peers } : {}),
			...(Object.keys(dependencies).length ? { dependencies } : {}),
			publishConfig: original.publishConfig,
		};
		fs.writeFileSync(
			path.join(destination, "package.json"),
			`${JSON.stringify(packageJson, null, 2)}\n`,
		);
	}
	return {
		profile: profileName,
		format: profile.format,
		directory: destination,
		sourceFiles: graph?.files.size ?? copied.size,
	};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try {
		const args = process.argv.slice(2);
		const value = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
		const result = prepareRelease({
			profileName: value("--profile") ?? "web",
			output: value("--out"),
		});
		console.log(JSON.stringify(result, null, 2));
		if (args.includes("--pack") || args.includes("--publish")) {
			if (result.format !== "npm")
				throw new Error("Native source profiles use their own Gradle/SwiftPM release workflow");
			const command = args.includes("--publish") ? ["publish"] : ["pm", "pack"];
			const run = spawnSync("bun", command, { cwd: result.directory, stdio: "inherit" });
			if (run.status !== 0) process.exit(run.status ?? 1);
		}
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
}
