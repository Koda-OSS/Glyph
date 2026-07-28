import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { compare, create, index, query, serialize } from "./src/index.ts";

type Input = {
  label: string;
  text: string;
};

function printUsage(): never {
  console.error("Usage:");
  console.error("  npm run demo -- <file-or-text-a> <file-or-text-b>");
  console.error('  npm run demo -- "text a|text b"');
  console.error('  npm run demo -- search "your query"');
  console.error("");
  console.error("Compare mode: each arg is a file path if it exists, otherwise literal text.");
  console.error("Search mode: indexes docs/**/*.md and ranks matches.");
  process.exit(1);
}

function listMarkdownFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function runDocsSearch(searchText: string): void {
  const docsDir = resolve("docs");
  const idx = index.new();
  const files = listMarkdownFiles(docsDir);

  if (files.length === 0) {
    console.error("No markdown files found under docs/");
    process.exit(1);
  }

  const docs = files.map((filePath) => ({
    key: relative(docsDir, filePath).replaceAll("\\", "/"),
    text: readFileSync(filePath, "utf8"),
  }));

  const indexStarted = performance.now();
  for (const doc of docs) {
    idx.set(doc.key, create(doc.text).glyph);
  }
  const indexMs = performance.now() - indexStarted;

  const queryStarted = performance.now();
  const results = query(create(searchText).glyph, idx, {
    limit: 5,
    threshold: 0,
    normalize: true,
  });
  const queryMs = performance.now() - queryStarted;

  console.log(`Indexed ${idx.size()} docs in ${indexMs.toFixed(3)} ms at ${(indexMs / idx.size()).toFixed(3)}ms per doc`);
  console.log(`Queried in ${queryMs.toFixed(2)} ms`);
  console.log(`Query: ${searchText}`);
  console.log();

  if (results.length === 0) {
    console.log("No matches.");
    return;
  }

  for (const [i, hit] of results.entries()) {
    console.log(
      `${i + 1}. ${hit.key}  ${(hit.similarity * 100).toFixed(2)}%`,
    );
  }
}

function parseCompareArgs(argv: string[]): [string, string] {
  const args = argv.slice(2);

  if (args.length === 1 && args[0]!.includes("|")) {
    const [left, right, ...rest] = args[0]!.split("|");
    if (left === undefined || right === undefined || rest.length > 0) {
      printUsage();
    }
    return [left, right];
  }

  if (args.length === 2) {
    return [args[0]!, args[1]!];
  }

  if (args.length > 2) {
    console.error(
      `Received ${args.length} arguments — your shell probably split the strings.`,
    );
    console.error("Got:", args);
    console.error("");
  }

  printUsage();
}

function resolveInput(value: string): Input {
  const absolute = resolve(value);

  if (existsSync(absolute) && statSync(absolute).isFile()) {
    try {
      return {
        label: value,
        text: readFileSync(absolute, "utf8"),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to read "${value}": ${message}`);
      process.exit(1);
    }
  }

  return {
    label: value,
    text: value,
  };
}

function runCompare(leftArg: string, rightArg: string): void {
  const leftInput = resolveInput(leftArg);
  const rightInput = resolveInput(rightArg);

  const left = create(leftInput.text, { size: 128 });
  const right = create(rightInput.text, { size: 128 });
  const result = compare(left, right);

  const showSerialized = false;
  console.log(
    `A: ${leftInput.label}${showSerialized ? ` ${serialize(left)}` : ""}`,
  );
  console.log(
    `B: ${rightInput.label}${showSerialized ? ` ${serialize(right)}` : ""}`,
  );
  console.log();
  console.log(`similarity: ${(result.similarity * 100).toFixed(2)}%`);
  console.log(`matches:    ${result.matches}/${result.size}`);
  console.log(`distance:   ${result.distance}`);
}

const args = process.argv.slice(2);

if (args[0] === "search" || args[0] === "--search") {
  const searchText = args.slice(1).join(" ").trim();
  if (!searchText) {
    printUsage();
  }
  runDocsSearch(searchText);
} else {
  const [leftArg, rightArg] = parseCompareArgs(process.argv);
  runCompare(leftArg, rightArg);
}
