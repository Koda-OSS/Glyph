/**
 * Rank related doc pages with Glyph query and update ## Related sections.
 *
 * Usage:
 *   npx tsx scripts/docs-related.ts          # print suggestions
 *   npx tsx scripts/docs-related.ts --write  # update markdown files
 *   npx tsx scripts/docs-related.ts --check  # exit 1 if any file is stale
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Create, index, query } from "../src/main.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_DIR = join(ROOT, "docs");

const MARKER_START = "<!-- glyph-related:start -->";
const MARKER_END = "<!-- glyph-related:end -->";
const RELATED_HEADING = "## Related";
const FOOTER =
  "_Related links ranked by [Glyph](https://github.com/Koda-OSS/Glyph)._";

/** Hub / reference pages — skip auto-related (curate manually). */
const SKIP = new Set([
  "README.md",
  "api-surface.md",
  "migration-0.4-to-1.0.md",
]);

const MIN_RELATED = 3;
const MAX_RELATED = 5;
const MODE = process.argv.includes("--write")
  ? "write"
  : process.argv.includes("--check")
    ? "check"
    : "print";

type DocEntry = {
  key: string;
  absPath: string;
  relFromDocs: string;
  title: string;
  text: string;
};

function listMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(full));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}

function extractTitle(content: string, fallback: string): string {
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      return trimmed.slice(2).trim();
    }
  }
  return fallback;
}

function loadDocs(): DocEntry[] {
  return listMarkdownFiles(DOCS_DIR).map((absPath) => {
    const relFromDocs = relative(DOCS_DIR, absPath).replaceAll("\\", "/");
    const raw = readFileSync(absPath, "utf8");
    const text = stripRelatedSections(raw);
    const title = extractTitle(raw, relFromDocs.replace(/\.md$/, ""));
    return {
      key: relFromDocs,
      absPath,
      relFromDocs,
      title,
      text,
    };
  });
}

function relLink(fromRel: string, toRel: string): string {
  const fromDir = dirname(fromRel).replace(/\\/g, "/");
  const prefix = fromDir === "." ? "" : `${fromDir}/`;
  const raw = relative(prefix || ".", toRel).replaceAll("\\", "/");
  return raw.startsWith(".") ? raw : `./${raw}`;
}

function rankRelated(
  source: DocEntry,
  corpus: DocEntry[],
  idx: ReturnType<typeof index.New>,
): DocEntry[] {
  const probe = Create(source.text, { size: 128 }).glyph;
  const hits = query.New(idx).Search(probe, {
    limit: MAX_RELATED + 5,
    threshold: 0.05,
  });

  const ranked: DocEntry[] = [];
  const byKey = new Map(corpus.map((d) => [d.key, d]));

  const sortedHits = [...hits].sort((a, b) => {
    if (b.similarity !== a.similarity) {
      return b.similarity - a.similarity;
    }
    return a.key.localeCompare(b.key);
  });

  for (const hit of sortedHits) {
    if (hit.key === source.key) {
      continue;
    }
    const doc = byKey.get(hit.key);
    if (doc === undefined) {
      continue;
    }
    ranked.push(doc);
    if (ranked.length >= MAX_RELATED) {
      break;
    }
  }

  return ranked;
}

function buildRelatedBlock(fromRel: string, related: DocEntry[]): string {
  const bullets = related
    .map((doc) => `- [${doc.title}](${relLink(fromRel, doc.relFromDocs)})`)
    .join("\n");

  return [
    RELATED_HEADING,
    "",
    MARKER_START,
    bullets,
    MARKER_END,
    "",
    FOOTER,
    "",
  ].join("\n");
}

function stripRelatedSections(content: string): string {
  const match = content.match(/^## (See also|Next steps|Related)\r?$/m);
  if (match === null || match.index === undefined) {
    return content.trimEnd();
  }
  return content.slice(0, match.index).trimEnd();
}

function applyRelatedSection(content: string, block: string): string {
  return `${stripRelatedSections(content)}\n\n${block}`;
}

function extractLinks(markedBody: string): string[] {
  return [...markedBody.matchAll(/- \[.*?\]\((.*?)\)/g)].map((m) => m[1]!);
}

function isStale(content: string, block: string): boolean {
  const marked = new RegExp(
    `${MARKER_START}\\r?\\n([\\s\\S]*?)\\r?\\n${MARKER_END}`,
    "m",
  );
  const fileMatch = content.match(marked);
  const blockMatch = block.match(marked);
  if (fileMatch === null || blockMatch === null) {
    return true;
  }
  const fileLinks = extractLinks(fileMatch[1]!).sort();
  const blockLinks = extractLinks(blockMatch[1]!).sort();
  if (fileLinks.length !== blockLinks.length) {
    return true;
  }
  return fileLinks.some((link, i) => link !== blockLinks[i]);
}

function main(): void {
  const corpus = loadDocs();
  const targets = corpus.filter((d) => !SKIP.has(d.relFromDocs));

  const idx = index.New({ mode: "direct" });
  for (const doc of corpus) {
    idx.Set(doc.key, Create(doc.text, { size: 128 }).glyph);
  }

  let staleCount = 0;

  for (const source of targets) {
    let related = rankRelated(source, corpus, idx);

    if (related.length < MIN_RELATED) {
      const fallback = corpus
        .filter(
          (d) =>
            d.key !== source.key && !related.some((r) => r.key === d.key),
        )
        .sort((a, b) => a.key.localeCompare(b.key));
      related = [...related, ...fallback].slice(0, MAX_RELATED);
    }

    const block = buildRelatedBlock(source.relFromDocs, related);
    const content = readFileSync(source.absPath, "utf8");
    const next = applyRelatedSection(content, block);

    if (MODE === "print") {
      console.log(`\n${source.relFromDocs}`);
      for (const doc of related) {
        console.log(`  - ${doc.title}`);
      }
      continue;
    }

    if (MODE === "check") {
      if (isStale(content, block)) {
        console.error(`stale: docs/${source.relFromDocs}`);
        staleCount += 1;
      }
      continue;
    }

    if (content !== next) {
      writeFileSync(source.absPath, next, "utf8");
      console.log(`updated docs/${source.relFromDocs}`);
    }
  }

  if (MODE === "check" && staleCount > 0) {
    console.error(
      `\n${staleCount} doc(s) have stale Related sections. Run: npm run docs:related`,
    );
    process.exit(1);
  }
}

main();
