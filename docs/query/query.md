![Glyph Query](/docs/media/RibbonQuery.png)

# Query

> Wrap an index with `query.New(idx)`, then rank entries with `Search()`.

Query is a **first-class module** that wraps a `GlyphIndexInstance`. The index owns storage and `CandidateKeys`; query owns probe → ranked results.

## Signature

```ts
query.New(index: GlyphIndexInstance): GlyphQueryInstance

instance.Search(
  probe: Glyph | GlyphSignature | GlyphGroupInput,
  options?: GlyphQueryOptions,
): GlyphQueryResult[]
```

## Example

```ts
import { Create, index, query } from "glyph-ts";

const idx = index.New();
idx.Set("moon", Create("Goodbye moon").glyph);
idx.Set("sun", Create("Goodbye sun").glyph);
idx.Set("pasta", Create("unrelated pasta recipe").glyph);

const results = query.New(idx).Search(Create("Goodbye moon").glyph, {
  limit: 5,
  threshold: 0.1,
  normalize: true,
});
```

## Flow

```text
q = query.New(index)
for each key in index.CandidateKeys(probe):
  value = index.Get(key)
  comparison = Compare(probe, value, compareOptions)
  if comparison.similarity < threshold: skip
  collect { key, similarity, comparison }

sort by similarity descending
apply limit (if set)
if normalize: divide each similarity by top score
return results
```

## Compare routing

| Index value | Compare path |
| --- | --- |
| Single glyph | `CompareGlyphs` |
| Map group (or array input, normalized) | `CompareGroups` (default aggregate: max) |

Pass `aggregate` or `compare` in options. See [Query options](./options.md).

## Performance

By default the index uses **LSH banding** (`mode: "bands"`). `Search` scores `CandidateKeys` from band collisions, not every key. Use `index.New({ mode: "direct" })` for an exact full scan. See [Index](../core/index.md).

## See also

- [Query options](./options.md)
- [Query results](./results.md)
- [Index](../core/index.md)
- [Migration 0.4 → 1.0](../migration-0.4-to-1.0.md)
