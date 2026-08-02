![Glyph Ribbon](/docs/media/RibbonGlyph.png)

# Compare

> Score similarity between glyphs with `Compare()`, `CompareGlyphs()`, or `CompareGroups()`.

Comparison estimates **Jaccard similarity** between two text feature bags by counting equal MinHash slots.

## `Compare(a, b, options?)`

Routes automatically:

| Input on either side | Path |
| --- | --- |
| Single glyph, signature, or record | `CompareGlyphs` |
| `GlyphGroup` / `GlyphGroupInput` (map or array) | `CompareGroups` |

```ts
import { Create, Compare } from "@koda.oss/glyph";

const a = Create("Goodbye moon");
const b = Create("Goodbye sun");

Compare(a, b);
Compare(a.glyph, b.glyph);
```

Accepts `Glyph`, `GlyphSignature`, `GlyphRecord`, or `GlyphGroupInput` (map or array).

## `CompareGlyphs(a, b, options?)`

Pairwise compare only. Use when both sides are single glyphs (or signatures/records).

```ts
import { Create, CompareGlyphs } from "@koda.oss/glyph";

CompareGlyphs(Create("a"), Create("b"));
```

`CompareGroups` uses this internally for every pair.

## `CompareGroups(group1, group2, options?)`

Explicit group compare. Scores every pair, then aggregates (default: max).

```ts
import { CreateGroup, CompareGroups } from "@koda.oss/glyph";

CompareGroups(
  CreateGroup(["alpha beta", "gamma delta"]),
  CreateGroup(["gamma delta", "unrelated"]),
);
```

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
  aggregate?: GroupResultAggregator; // CompareGroups only
}
```

`CompareGlyphs` ignores `aggregate`. See [Groups](./groups.md).

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

## Related

<!-- glyph-related:start -->
- [Groups](./groups.md)
- [Getting started](../getting-started.md)
- [Query results](../query/results.md)
- [Create](./create.md)
- [Spotlight](../spotlight/document.md)
<!-- glyph-related:end -->

_Related links ranked by [Glyph](https://github.com/Koda-OSS/Glyph)._
