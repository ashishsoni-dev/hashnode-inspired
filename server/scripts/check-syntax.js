import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(".");
const files = [];
const ignoredDirectories = new Set(["node_modules", ".git", "coverage", "dist"]);

function collect(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
            continue;
        }

        const path = join(directory, entry.name);

        if (entry.isDirectory()) {
            collect(path);
        } else if (entry.isFile() && path.endsWith(".js")) {
            files.push(path);
        }
    }
}

collect(root);
let failed = false;

for (const file of files) {
    const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });

    if (result.status !== 0) {
        failed = true;
        process.stderr.write(`\nSyntax error in ${file}\n${result.stderr || result.stdout}`);
    }
}

if (failed) process.exit(1);
console.log(`Syntax check passed for ${files.length} project JavaScript files.`);
