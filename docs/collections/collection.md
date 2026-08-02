![Glyph Collections](/docs/media/RibbonCollections.png)

# Collections

> Store keyed glyphs. Pre-aggregate them into one fingerprint.

A **collection** holds a keyed glyph group (`Record<string, Glyph>`). On every mutation it rebuilds `collection.glyph` by running a **CollectionAggregator** once per slot across all members.

Collections do **not** query an index. Pass `col.glyph` or `col.Collection()` to `query()` yourself when you want search.

## Create a collection

```ts
import { CollectionAggregatorSoftmax, collections } from "glyph-ts";

const col = collections.new({
  create: { size: 128, normalize: true },
  aggregator: CollectionAggregatorSoftmax, // default
});
```

| Option | Default | Meaning |
| --- | --- | --- |
| `create` | `{}` | Forwarded to `Create()` when `Add` receives a string |
| `aggregator` | `CollectionAggregatorSoftmax` | Slot-wise function that builds `glyph` |

## Methods

| Method | Behavior |
| --- | --- |
| `glyph` | Cached pre-aggregated glyph (zeros when empty) |
| `Add(key, string \| Glyph)` | Store an example (strings are fingerprinted); rebuilds `glyph` |
| `AddGroup(group)` | Merge a `Glyph[]` or `Record<string, Glyph>`; rebuilds `glyph` |
| `Remove(key)` | Delete one example; rebuilds `glyph` |
| `Clear()` | Remove all examples; `glyph` becomes zeros |
| `Collection()` | Snapshot copy of every key → glyph |
| `Has(key)` | Whether the key exists |
| `Count()` | Number of examples |

## Add examples

```ts
import { Create, collections } from "glyph-ts";

const col = collections.new({ create: { size: 128 } });

col.Add("moon", "goodbye moon farewell night");
col.Add("sun", Create("goodbye sun hello day").glyph);

col.AddGroup({
  stars: Create("stars shine across the sky").glyph,
});
```

`Add` overwrites an existing key. All glyphs in a collection must share the same length.

## Empty collection

When `Count() === 0`, `glyph` is a zero-filled `Uint32Array` sized from `create.size` (default **128**).

## Search yourself

```ts
import { query } from "glyph-ts";

// Fast single-glyph probe (pre-aggregated)
query(col.glyph, index, { limit: 5 });

// Full group compare (every member vs index entries)
query(col.Collection(), index, { limit: 5 });
```

## See also

- [Your first collection](../your-first-collection.md)
- [Collection aggregators](./aggregate.md)
- [Groups](../core/groups.md) — `GroupResultAggregator` for pairwise score collapse
- [Query](../query/query.md)
- [Index](../core/index.md)
