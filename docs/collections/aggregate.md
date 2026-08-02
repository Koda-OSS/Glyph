![Glyph Collections](/docs/media/RibbonCollections.png)

# Collection aggregators

> Collapse member glyphs into one fingerprint, slot by slot.

A **CollectionAggregator** runs once per signature index. For a collection of 11 glyphs of length 128, Glyph calls your aggregator **128 times**, each time with an array of 11 slot values.

This is different from a **GroupResultAggregator**, which collapses pairwise *similarity scores* after `CompareGroups`. Collections aggregate *hash values* into a single glyph.

| Aggregator | Input | Output |
| --- | --- | --- |
| `CollectionAggregator` | Per-slot `number[]` from member glyphs | One uint32 slot → builds `collection.glyph` |
| `GroupResultAggregator` | Pairwise similarity `scores[]` | One similarity number for group compare |

## Built-ins

| Export | Formula | Notes |
| --- | --- | --- |
| `CollectionAggregatorSoftmax` | `(sum(v³) / n) ** (1/3)` | Power mean, exponent 3 — **Default** |
| `CollectionAggregatorMin` | `min(values)` | |
| `CollectionAggregatorMax` | `max(values)` | |
| `CollectionAggregatorMean` | `sum / n` | Rounded to uint32 |
| `CollectionAggregatorMid` | `(min + max) / 2` | |
| `CollectionAggregatorSum` | `sum(values)` | Clamped to `0xFFFFFFFF` |

```ts
import {
  CollectionAggregatorMax,
  collections,
} from "@koda.oss/glyph";

const col = collections.New({
  create: { size: 128 },
  aggregator: CollectionAggregatorMax,
});
```

Outputs are rounded and clamped to the uint32 range before writing each slot.

## Custom aggregator

```ts
import type { CollectionAggregator } from "@koda.oss/glyph";
import { collections } from "@koda.oss/glyph";

const first: CollectionAggregator = (values, context) => {
  // context.collection — current GlyphGroup snapshot
  // context.index — slot being written
  return values[0] ?? 0;
};

const col = collections.New({ aggregator: first });
```

## Rebuild timing

`collection.glyph` is recomputed after every `Add`, `AddGroup`, `Remove`, and `Clear`. There is no separate rebuild API.

## Using the result

```ts
import { Compare, index, query } from "@koda.oss/glyph";

const idx = index.New();
Compare(col.glyph, probe);
query.New(idx).Search(col.glyph, { limit: 10 });
```

## Related

<!-- glyph-related:start -->
- [Your first collection](../your-first-collection.md)
- [Collections](./collection.md)
- [Query](../query/query.md)
- [Query options](../query/options.md)
- [Building an index](../building-an-index.md)
<!-- glyph-related:end -->

_Related links ranked by [Glyph](https://github.com/Koda-OSS/Glyph)._
