![Glyph Collections](/docs/media/RibbonCollections.png)

# Collection query

> Rank an index against a collection’s examples.

`CollectionQuery` (and `collection.Query`) treat the collection as a **glyph group probe** and reuse `query()`.

```ts
import { CollectionQuery, collections, Create, index } from "glyph-ts";

const col = collections.new({ create: { size: 128 } });
col.Add("moon", "goodbye moon");
col.Add("sun", "goodbye sun");

const idx = index.new();
idx.set("doc-a", Create("goodbye moon stars").glyph);
idx.set("doc-b", Create("unrelated pasta").glyph);

const hits = col.Query(idx, {
  limit: 5,
  threshold: 0,
  normalize: true,
});

// same result
CollectionQuery(col, idx, { limit: 5, normalize: true });
```

## Equivalent call

```ts
query(collection.Examples(), index, options)
```

Default group aggregate is **max** pairwise similarity (best example vs each index entry).

## Options

Same as [Query options](../query/options.md): `limit`, `threshold`, `normalize`, `aggregate`, `compare`.

## Results

Same shape as [Query results](../query/results.md): `GlyphQueryResult[]`.

When an index value is a group, `matched` may identify the winning member on that side. The winning **example** key (collection side) is available on `comparison.matchedLeft` when present.

## Errors

| Condition | Result |
| --- | --- |
| Empty collection | Throws |

## Collections vs query

| Goal | API |
| --- | --- |
| One probe glyph vs index | `query(probe, index)` |
| Many labeled examples vs index | `CollectionQuery(col, index)` / `col.Query(index)` |

## See also

- [Collections](./collection.md)
- [Query](../query/query.md)
- [Groups](../core/groups.md)
