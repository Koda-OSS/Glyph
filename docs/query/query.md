![Glyph Query](/docs/media/RibbonQuery.png)

# Query

> Rank index entries against a probe glyph with `query()`.

`query()` ranks `candidateKeys` from the index against the probe, filters by threshold, sorts by similarity, and optionally limits and normalizes results.

## Signature

```ts
query(
  queryGlyph: Glyph | GlyphSignature | GlyphGroup,
  glyphIndex: GlyphIndexInstance,
  options?: GlyphQueryOptions,
): GlyphQueryResult[]
```

## Example

```ts
import { Create, index, query } from "glyph-ts";

const idx = index.new();
idx.set("moon", Create("Goodbye moon").glyph);
idx.set("sun", Create("Goodbye sun").glyph);
idx.set("pasta", Create("unrelated pasta recipe").glyph);

const results = query(Create("Goodbye moon").glyph, idx, {
  limit: 5,
  threshold: 0.1,
  normalize: true,
});
```

## Flow

```text
for each key in index.candidateKeys(queryGlyph):
  value = index.get(key)
  comparison = Compare(queryGlyph, value, compareOptions)
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

By default the index uses **LSH banding** (`mode: "bands"`). `query()` scores `candidateKeys` from band collisions, not every key. Use `index.new({ mode: "direct" })` for an exact full scan. See [Index](../core/index.md).

## See also

- [Query options](./options.md)
- [Query results](./results.md)
- [Index](../core/index.md)
