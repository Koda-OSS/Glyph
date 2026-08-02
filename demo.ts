import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  Compare,
  collections,
  completions,
  Create,
  index,
  query,
  Serialize,
  spotlight,
} from "./src/main.ts";

type Input = {
  label: string;
  text: string;
};

function printUsage(): never {
  console.error("Usage:");
  console.error("  npm run demo -- <file-or-text-a> <file-or-text-b>");
  console.error('  npm run demo -- "text a|text b"');
  console.error('  npm run demo -- search "your query"');
  console.error('  npm run demo -- complete "your prefix"');
  console.error('  npm run demo -- spotlight <file-or-text> "your probe"');
  console.error('  npm run demo -- collection "example a" "example b" ...');
  console.error("");
  console.error("Compare mode: each arg is a file path if it exists, otherwise literal text.");
  console.error("Search mode: indexes docs/**/*.md and ranks matches.");
  console.error("Complete mode: ingests docs and suggests next words for a prefix.");
  console.error("Spotlight mode: chunks one document and ranks snippets against a probe.");
  console.error("Collection mode: builds a Softmax-aggregated collection glyph from examples.");
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

function loadDocs(): { key: string; text: string }[] {
  const docsDir = resolve("docs");
  const files = listMarkdownFiles(docsDir);

  if (files.length === 0) {
    console.error("No markdown files found under docs/");
    process.exit(1);
  }

  return files.map((filePath) => ({
    key: relative(docsDir, filePath).replaceAll("\\", "/"),
    text: readFileSync(filePath, "utf8"),
  }));
}

function truncate(text: string, max = 100): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) {
    return oneLine;
  }
  return `${oneLine.slice(0, max - 1)}…`;
}

function runDocsComplete(prefix: string): void {
  const docs = loadDocs();
  const chain = completions.New();

  const ingestStarted = performance.now();
  for (const doc of docs) {
    chain.Ingest(doc.key, doc.text);
  }
  const ingestMs = performance.now() - ingestStarted;

  const completeStarted = performance.now();
  const results = chain.Complete(prefix, { limit: 5, minCount: 1 });
  const completeMs = performance.now() - completeStarted;

  console.log(
    `Ingested ${docs.length} docs in ${ingestMs.toFixed(2)} ms (${(ingestMs / docs.length).toFixed(2)} ms/doc)`,
  );
  console.log(`Completed in ${completeMs.toFixed(2)} ms`);
  console.log(`Prefix: ${prefix}`);
  console.log();

  if (results.length === 0) {
    console.log("No suggestions.");
    return;
  }

  for (const [i, hit] of results.entries()) {
    console.log(
      `${i + 1}. ${hit.token}  score ${(hit.score * 100).toFixed(2)}%  count ${hit.count}  source ${hit.source.key}`,
    );
  }
}

function runDocsSearch(searchText: string): void {
  const docs = loadDocs();
  const idx = index.New();

  const indexStarted = performance.now();
  for (const doc of docs) {
    idx.Set(doc.key, Create(doc.text).glyph);
  }
  const indexMs = performance.now() - indexStarted;

  const queryStarted = performance.now();
  const results = query.New(idx).Search(Create(searchText).glyph, {
    limit: 5,
    threshold: 0,
    normalize: true,
  });
  const queryMs = performance.now() - queryStarted;

  console.log(
    `Indexed ${idx.Size()} docs in ${indexMs.toFixed(3)} ms at ${(indexMs / idx.Size()).toFixed(3)}ms per doc`,
  );
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

function runSpotlight(contentArg: string, probeText: string): void {
  const contentInput = resolveInput(contentArg);
  const probe = Create(probeText).glyph;

  const compileStarted = performance.now();
  const doc = spotlight.New(contentInput.text);
  const compileMs = performance.now() - compileStarted;

  const rankStarted = performance.now();
  const results = doc.Query(probe, { limit: 5, threshold: 0 });
  const rankMs = performance.now() - rankStarted;

  console.log(`Content: ${contentInput.label}`);
  console.log(
    `Compiled ${doc.Size()} chunks in ${compileMs.toFixed(2)} ms`,
  );
  console.log(`Ranked in ${rankMs.toFixed(2)} ms`);
  console.log(`Probe: ${probeText}`);
  console.log();

  if (results.length === 0) {
    console.log("No matches.");
    return;
  }

  for (const [i, hit] of results.entries()) {
    console.log(
      `${i + 1}. ${(hit.score * 100).toFixed(2)}%  ${truncate(hit.text)}`,
    );
  }
}

function runCollection(examples: string[]): void {
  const col = collections.New();

  for (const [i, example] of examples.entries()) {
    col.Add(`ex-${i + 1}`, example);
  }

  console.log(`Collection count: ${col.Count()}`);
  console.log(`Aggregated glyph size: ${col.glyph.length}`);
  console.log(`First 8 slots: [${[...col.glyph.slice(0, 8)].join(", ")}]`);
  console.log();
  console.log("Keys:", Object.keys(col.Collection()).join(", "));
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

  const left = Create(leftInput.text, { size: 128 });
  const right = Create(rightInput.text, { size: 128 });
  const result = Compare(left, right);

  const showSerialized = false;
  console.log(
    `A: ${leftInput.label}${showSerialized ? ` ${Serialize(left)}` : ""}`,
  );
  console.log(
    `B: ${rightInput.label}${showSerialized ? ` ${Serialize(right)}` : ""}`,
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
} else if (args[0] === "complete" || args[0] === "--complete") {
  const prefix = args.slice(1).join(" ").trim();
  if (!prefix) {
    printUsage();
  }
  runDocsComplete(prefix);
} else if (args[0] === "spotlight" || args[0] === "--spotlight") {
  const rest = args.slice(1);
  if (rest.length < 2) {
    printUsage();
  }
  const contentArg = rest[0]!;
  const probeText = rest.slice(1).join(" ").trim();
  if (!probeText) {
    printUsage();
  }
  runSpotlight(contentArg, probeText);
} else if (args[0] === "collection" || args[0] === "--collection") {
  const examples = args.slice(1).map((s) => s.trim()).filter(Boolean);
  if (examples.length === 0) {
    printUsage();
  }
  runCollection(examples);
} else {
  const [leftArg, rightArg] = parseCompareArgs(process.argv);
  runCompare(leftArg, rightArg);
}
