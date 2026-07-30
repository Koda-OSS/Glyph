![Glyph Collections](/docs/media/RibbonCollections.png)

# Collections

> Labeled example glyphs you can query against an index.

A **collection** stores keyed examples (`Record<string, Glyph>`). Feed strings or glyphs, then rank an index by treating the examples as a **group probe** (default aggregate: max).

## Create a collection

```ts
import { collections } from "glyph-ts";

const col = collections.new({
  create: { size: 128, normalize: true },
});
```

| Option | Default | Meaning |
| --- | --- | --- |
| `create` | `{}` | Forwarded to `Create()` when `Add` receives a string |

## Methods

| Method | Behavior |
| --- | --- |
| `Add(key, string \| Glyph)` | Store an example (strings are fingerprinted) |
| `AddGroup(record)` | Merge a `Record<string, Glyph>` (arrays throw) |
| `Remove(key)` | Delete one example |
| `Clear()` | Remove all examples |
| `Examples()` | Snapshot copy of every key → glyph |
| `Has(key)` | Whether the key exists |
| `Count()` | Number of examples |
| `Query(index, options?)` | Rank the index — see [Collection query](./query.md) |

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

`Add` overwrites an existing key. `AddGroup` rejects arrays — use map keys as example keys.

## See also

- [Collection query](./query.md)
- [Index](../query/index.md)
- [Groups](../core/groups.md)
