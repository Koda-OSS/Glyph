![Glyph Collections](/docs/media/RibbonCollections.png)

# Your first collection

> Store labeled glyphs. Pre-aggregate them into one fingerprint.

A **collection** holds keyed examples and rebuilds `collection.glyph` on every change using a **CollectionAggregator** (default: `CollectionAggregatorSoftmax`).

## Create a collection

```ts
import { collections } from "@koda.oss/glyph";

const col = collections.New({ create: { size: 128 } });

col.Add("moon", "goodbye moon farewell night");
col.Add("sun", "goodbye sun hello day");

console.log(col.Count()); // 2
```

## Use the aggregated glyph

Pass `col.glyph` to compare or query — one probe instead of scoring every example pairwise.

```ts
import { Create, index, query } from "@koda.oss/glyph";

const idx = index.New({ mode: "direct" });
idx.Set("doc-a", Create("goodbye moon stars").glyph);
idx.Set("doc-b", Create("unrelated pasta").glyph);

const hits = query.New(idx).Search(col.glyph, { limit: 5, normalize: true });
```

For full group semantics (every member vs each index entry), pass `col.Collection()` instead.

## Pick an aggregator

```ts
import {
  CollectionAggregatorMax,
  CollectionAggregatorMin,
  collections,
} from "@koda.oss/glyph";

const col = collections.New({
  create: { size: 128 },
  aggregator: CollectionAggregatorMax,
});
```

Built-ins: Min, Max, Mean, Mid, Sum, Softmax. See [Aggregators](./collections/aggregate.md).

## Related

<!-- glyph-related:start -->
- [Collections](./collections/collection.md)
- [Collection aggregators](./collections/aggregate.md)
- [Query](./query/query.md)
- [Building an index](./building-an-index.md)
- [Query options](./query/options.md)
<!-- glyph-related:end -->

_Related links ranked by [Glyph](https://github.com/Koda-OSS/Glyph)._
