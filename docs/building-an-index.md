# Building an index

> Create glyphs once. Query many keys in memory.

An **index** maps string keys to one glyph or a **glyph group**. Use `query()` to rank all entries against a probe glyph.

## Basic workflow

```ts
import { create, index, query } from "glyph-ts";

const idx = index.new();

idx.set("doc-a", create("first document text").glyph);
idx.set("doc-b", create("second document text").glyph);
idx.set("doc-c", create("third document text").glyph);

const probe = create("document text").glyph;
const hits = query(probe, idx, {
  limit: 5,
  threshold: 0,
  normalize: true,
});

for (const hit of hits) {
  console.log(hit.key, hit.similarity);
}
```

## Steps

| Step | Action |
| --- | --- |
| 1 | Call `index.new()` |
| 2 | Fingerprint source text with `create()` |
| 3 | Store with `idx.set(key, glyph)` or `idx.add(key, glyph)` |
| 4 | Build a probe glyph from query text |
| 5 | Call `query(probe, idx, options)` |

## Store one glyph per key

```ts
idx.set("readme", create(readFileText).glyph);
```

## Store multiple glyphs per key

Use a group when one key has several fingerprints (for example, many chunks).

```ts
idx.set("article", [
  create("section one").glyph,
  create("section two").glyph,
]);
```

Or use `add` to append over time:

```ts
idx.set("article", create("section one").glyph);
idx.add("article", create("section two").glyph);
// value is now [glyph1, glyph2]
```

See [Index](./query/index.md) for `add` promotion rules.

## Query options (common)

| Option | Typical value | Effect |
| --- | --- | --- |
| `limit` | `5` | Return at most N results |
| `threshold` | `0` | Drop results below this raw similarity |
| `normalize` | `true` | Divide scores by the top hit (best → `1.0`) |

Details: [Query options](./query/options.md).

## Demo: search project docs

The repo demo indexes `docs/**/*.md` and ranks matches.

```bash
npm run demo -- search "how do groups work"
```

Output includes index time, query time, and ranked doc paths. File reads are prefetched before the index timer starts.

## Limits

| Topic | Behavior |
| --- | --- |
| Persistence | Index lives in memory only |
| Query algorithm | Linear scan over all keys |
| Key type | String only |
