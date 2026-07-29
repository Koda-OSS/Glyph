# Compare

> Score similarity between glyphs with `compare()` or `GlyphDirectCompare()`.

Comparison estimates **Jaccard similarity** between two text feature bags by counting equal MinHash slots.

## `compare(a, b, options?)`

Routes automatically:

| Input on either side | Path |
| --- | --- |
| Single glyph, signature, or record | Direct compare |
| `GlyphGroup` (array or record) | Group compare |

```ts
import { create, compare } from "glyph-ts";

const a = create("Goodbye moon");
const b = create("Goodbye sun");

compare(a, b);
compare(a.glyph, b.glyph);
```

Accepts `Glyph`, `GlyphSignature`, `GlyphRecord`, or `GlyphGroup`.

## `GlyphDirectCompare(a, b, options?)`

Pairwise compare only. Use when both sides are single glyphs (or signatures/records).

Group compare uses this internally for every pair.

## Result: `GlyphComparisonResult`

```json
{
  "similarity": 0.35,
  "matches": 45,
  "distance": 83,
  "size": 128
}
```

| Field | Meaning |
| --- | --- |
| `similarity` | `matches / size` |
| `matches` | Equal signature slots |
| `distance` | `size - matches` |
| `size` | Signature length |

## Options

```ts
interface GlyphComparisonOptions {
  aggregate?: GroupAggregate; // group compare only
}
```

Direct compare ignores `aggregate`. See [Groups](./groups.md).

## Errors

| Condition | Result |
| --- | --- |
| Glyph `size` mismatch | Throws |
| Empty group | Throws |

## Interpret scores

| `similarity` | Typical meaning |
| --- | --- |
| `1.0` | Identical feature bags (usually identical normalized text) |
| High | Strong word/phrase overlap |
| Low | Little overlap |
| Near `0` | Unrelated |

> MinHash estimates set similarity. It is not edit distance or embedding cosine similarity.

## See also

- [Groups](./groups.md)
- [Query](../query/query.md)
