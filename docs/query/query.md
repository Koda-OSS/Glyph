![Glyph Query](/docs/media/RibbonQuery.png)

# Query

> Rank index entries against a probe glyph with `query()`.

`query()` compares the probe to every key in the index, filters by threshold, sorts by similarity, and optionally limits and normalizes results.

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
for each [key, value] in index.entries():
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
| `Glyph[]` or record | `CompareGroups` (default aggregate: max) |

Pass `aggregate` or `compare` in options. See [Query options](./options.md).

## Performance

Query scans **all keys** (linear time). There is no ANN or LSH index in the current version.

## See also

- [Query options](./options.md)
- [Query results](./results.md)
- [Index](./index.md)
