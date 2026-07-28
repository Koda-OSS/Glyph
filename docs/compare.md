# Comparing glyphs

## `compare(a, b, options?)`

High-level entry point. Routes automatically:

- both sides are single glyphs/signatures/records → **direct compare**
- either side is a [group](./groups.md) → **group compare**

```ts
import { create, compare } from "glyph-ts";

const a = create("Goodbye moon");
const b = create("Goodbye sun");

const result = compare(a, b);
// or compare(a.glyph, b.glyph)
```

## Result: `GlyphComparisonResult`

| Field | Meaning |
| --- | --- |
| `similarity` | Estimated Jaccard similarity (`0`–`1`) |
| `matches` | Matching MinHash slots |
| `distance` | `size - matches` |
| `size` | Signature length |

```ts
similarity ≈ matches / size
```

## `GlyphDirectCompare(a, b, options?)`

Pairwise MinHash comparison only. Used internally by group compare; export it when you want to skip group routing.

```ts
import { GlyphDirectCompare, create } from "glyph-ts";

GlyphDirectCompare(create("a"), create("b"));
```

Accepted inputs for direct compare: `Glyph`, `GlyphSignature`, or `GlyphRecord`.

## Options

```ts
interface GlyphComparisonOptions {
  aggregate?: GroupAggregate; // group compare only
}
```

Direct compare ignores `aggregate`. See [Groups](./groups.md) for aggregation.

## Errors

- **Size mismatch** — glyphs with different `size` cannot be compared.
- **Empty groups** — group compare throws if either side resolves to no glyphs.

## Interpreting scores

| Score | Typical meaning |
| --- | --- |
| `1.0` | Identical feature bags (usually identical normalized text) |
| high | Strong overlap (shared words/phrases) |
| low | Little overlap |
| `~0` | Unrelated |

MinHash estimates set similarity; it is not edit distance or embedding cosine similarity.
