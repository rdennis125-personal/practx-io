#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.argv[2] ? join(process.cwd(), process.argv[2]) : process.cwd();
const HEX_PATTERN = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})/g;
const KEYWORDS = ["box-shadow", "border-radius", "rgba(", "rgb("];

function walk(dir, matches = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, matches);
    } else if (/\.(tsx?|jsx?|css|scss|md)$/i.test(entry.name)) {
      const content = readFileSync(fullPath, "utf8");
      const lines = content.split(/\r?\n/);
      lines.forEach((line, index) => {
        const hexes = line.match(HEX_PATTERN);
        const keyword = KEYWORDS.find((token) => line.includes(token));
        if (hexes || keyword) {
          matches.push({ path: fullPath.replace(ROOT + "/", ""), line: index + 1, value: line.trim() });
        }
      });
    }
  }
  return matches;
}

const results = walk(ROOT, []);
if (results.length === 0) {
  console.log("No hard-coded styles detected.");
  process.exit(0);
}

console.log("Potential hard-coded styles:");
for (const match of results) {
  console.log(`${match.path}:${match.line}: ${match.value}`);
}
