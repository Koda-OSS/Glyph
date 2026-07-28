# Glyph Query

Search an in-memory glyph index with ranked similarity matches.

## Quick start

```ts
import { create, index, query } from "glyph-ts";

const idx = index.new();
idx.set("moon", create("Goodbye moon").glyph);
idx.set("sun", create("Goodbye sun").glyph);
idx.set("pasta", create("totally unrelated pasta recipe").glyph);

const results = query(create("Goodbye moon").glyph, idx, {
  limit: 5,
  threshold: 0.1,
  normalize: true,
});

for (const hit of results) {
  console.log(hit.key, hit.similarity);
}
```

## Index

```ts
const idx = index.new();

idx.set(key, glyph);          // store (or replace)
idx.set(key);                 // omit glyphs → remove key
idx.add(key, glyphOrGroup);   // append; promotes single → group
idx.get(key);
idx.has(key);
idx.remove(key);
idx.clear();
idx.size();
[...idx.keys()];
[...idx.values()];
[...idx.entries()];
```

Values are `Glyph | GlyphGroup` (`Glyph[]` or `Record<string, Glyph>`).

### Add promotion

| Existing | Add | Result |
| --- | --- | --- |
| missing | one glyph | that glyph |
| missing | many | array group |
| single glyph | more | `[old, ...added]` |
| array | more | concatenated array |
| record | more | merged record (auto keys `"0"`, `"1"`, …) |

## `query(queryGlyph, index, options?)`

Compares the query against every index entry via [`compare`](./compare.md) (direct or group), then ranks.

### Options

| Option | Default | Description |
| --- | --- | --- |
| `limit` | none | Max results returned |
| `threshold` | `0` | Minimum raw similarity to include |
| `normalize` | `false` | After ranking, divide scores by the top score (best → `1.0`) |
| `aggregate` | max | Group aggregate for group entries |
| `compare` | `{}` | Extra options forwarded to compare |

### Result

```ts
interface GlyphQueryResult {
  key: string;
  similarity: number;
  comparison: GlyphComparisonResult;
  matched?: string | number; // winning group member on the entry side
}
```

- Array group → numeric index of the best member  
- Record group → field name of the best member  
- Single glyph → `matched` omitted  

## Demo: search the docs

```bash
npm run demo -- search "how do groups work"
```

Indexes every markdown file under `docs/` and ranks matches for your query string.
