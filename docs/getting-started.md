# Getting started

GlyphTS turns text into compact **MinHash fingerprints** (glyphs), then estimates Jaccard similarity by comparing those fingerprints.

## Install

```bash
npm install glyph-ts
```

Requires Node.js 18+.

## First compare

```ts
import { create, compare } from "glyph-ts";

const a = create("the quick brown fox jumps over the lazy dog");
const b = create("the quick brown fox leaped over the lazy dog");

const { similarity, distance, matches, size } = compare(a, b);

console.log(similarity); // 0–1 Jaccard estimate
console.log(matches, "/", size);
console.log(distance);   // size - matches
```

## Mental model

1. **Tokenize** the text into words.
2. Build a feature bag of **tokens**, **unigrams**, and **vgrams**.
3. Hash that bag into a fixed-length `Uint32Array` signature (the glyph).
4. **Compare** two glyphs by counting matching signature slots.

Identical text → similarity `1`. Unrelated text → near `0`. Partial overlap lands in between.

## What you get back from `create`

```ts
const record = create("hello world");

record.version;   // create algorithm version
record.glyph;     // Uint32Array fingerprint
record.createdAt; // ms since epoch
```

Pass either the full record or `record.glyph` into `compare` / `serialize`.

## Next

- [Creating glyphs](./create.md)
- [Comparing](./compare.md)
- [Groups](./groups.md)
