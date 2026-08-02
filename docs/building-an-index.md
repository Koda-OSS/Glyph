![Glyph Ribbon](/docs/media/RibbonGlyph.png)

# Building an index

> Create glyphs once. Query many keys in memory.

An **index** maps string keys to one glyph or a **glyph group**. Wrap it with `query.New(idx)` and call `Search()` to rank candidate entries against a probe glyph (LSH banding by default).

## Basic workflow

```ts
import { Create, index, query } from "glyph-ts";

const idx = index.New();

idx.Set("doc-a", Create("first document text").glyph);
idx.Set("doc-b", Create("second document text").glyph);
idx.Set("doc-c", Create("third document text").glyph);

const probe = Create("document text").glyph;
const q = query.New(idx);
const hits = q.Search(probe, {
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
| 1 | Call `index.New()` |
| 2 | Fingerprint source text with `Create()` |
| 3 | Store with `idx.Set(key, glyph)` or `idx.Add(key, glyph)` |
| 4 | Build a probe glyph from query text |
| 5 | Call `query.New(idx).Search(probe, options)` |

## Store one glyph per key

```ts
idx.Set("readme", Create(readFileText).glyph);
```

## Store multiple glyphs per key

Use a group when one key has several fingerprints (for example, many chunks).

```ts
idx.Set("article", [
  Create("section one").glyph,
  Create("section two").glyph,
]);
```

Or use `Add` to append over time:

```ts
idx.Set("article", Create("section one").glyph);
idx.Add("article", Create("section two").glyph);
// value is now { "0": glyph1, "1": glyph2 }
```

See [Index](./core/index.md) for `Add` promotion rules.

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
| Find similar **documents** | `query.New(idx).Search()` — [Query](./query/query.md) |
| Search with a **pre-aggregated collection glyph** | `query.New(idx).Search(col.glyph)` — [Collections](./collections/collection.md) |
| Suggest the **next word** in a prefix | `chain.Complete()` — [Completions](./completions/complete.md) |

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
| Persistence | Index lives in memory only (disk persistence planned post-1.0) |
| Query algorithm | LSH banding by default; exact scan with `mode: "direct"` |
| Key type | String only |
