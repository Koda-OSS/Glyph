![Glyph Ribbon](/docs/media/RibbonGlyph.png)

# Building an index

> Create glyphs once. Query many keys in memory.

An **index** maps string keys to one glyph or a **glyph group**. Use `query()` to rank candidate entries against a probe glyph (LSH banding by default).

## Basic workflow

```ts
import { Create, index, query } from "glyph-ts";

const idx = index.new();

idx.set("doc-a", Create("first document text").glyph);
idx.set("doc-b", Create("second document text").glyph);
idx.set("doc-c", Create("third document text").glyph);

const probe = Create("document text").glyph;
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
| 2 | Fingerprint source text with `Create()` |
| 3 | Store with `idx.set(key, glyph)` or `idx.add(key, glyph)` |
| 4 | Build a probe glyph from query text |
| 5 | Call `query(probe, idx, options)` |

## Store one glyph per key

```ts
idx.set("readme", Create(readFileText).glyph);
```

## Store multiple glyphs per key

Use a group when one key has several fingerprints (for example, many chunks).

```ts
idx.set("article", [
  Create("section one").glyph,
  Create("section two").glyph,
]);
```

Or use `add` to append over time:

```ts
idx.set("article", Create("section one").glyph);
idx.add("article", Create("section two").glyph);
// value is now { "0": glyph1, "1": glyph2 }
```

See [Index](./core/index.md) for `add` promotion rules.

## Query options (common)

| Option | Typical value | Effect |
| --- | --- | --- |
| `limit` | `5` | Return at most N results |
| `threshold` | `0` | Drop results below this raw similarity |
| `normalize` | `true` | Divide scores by the top hit (best → `1.0`) |

Details: [Query options](./query/options.md).

## Completions vs query

| Goal | API |
| --- | --- |
| Find similar **documents** | `query()` — [Query](./query/query.md) |
| Search with **labeled examples** | `CollectionQuery()` — [Collections](./collections/collection.md) |
| Suggest the **next word** in a prefix | `completions.complete()` — [Completions](./completions/complete.md) |

## Demo: search project docs

The repo demo indexes `docs/**/*.md` and ranks matches. See [Demo CLI](./demo.md) for all modes.

```bash
npm run demo -- search "how do groups work"
npm run demo -- complete "how do groups"
npm run demo -- spotlight ./docs/core/index.md "LSH banding"
```

Output includes ingest/index time, query/complete time, and ranked results.

## Limits

| Topic | Behavior |
| --- | --- |
| Persistence | Index lives in memory only |
| Query algorithm | LSH banding by default; exact scan with `mode: "direct"` |
| Key type | String only |
