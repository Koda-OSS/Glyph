![Glyph Query](/docs/media/RibbonQuery.png)

# Query results

> Shape of each hit returned by `query()`.

```ts
interface GlyphQueryResult {
  key: string;
  similarity: number;
  comparison: GlyphComparisonResult;
}
```

## Fields


| Field        | Type                    | Meaning                                    |
| ------------ | ----------------------- | ------------------------------------------ |
| `key`        | `string`                | Index key for this entry                   |
| `similarity` | `number`                | Score for ranking (`0`–`1`, or normalized) |
| `comparison` | `GlyphComparisonResult` | Full compare output for this pair          |


## `comparison` object

```json
{
  "similarity": 0.35,
  "matches": 45,
  "distance": 83,
  "size": 128
}
```

Same fields as [Compare](../core/compare.md). When `normalize: true`, `comparison.similarity` matches the result-level `similarity` after scaling.

## Sort order

Results are sorted by `similarity` descending. Index iteration order does not affect rank.

## Empty results

`query()` returns `[]` when:

- The index has no keys, or
- Every entry is below `threshold`



## Coming soon


| Field     | Status                                                                 | Reason                                                                                                                                                                                                                                                |
| --------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `matched` | **Not documented.** *Compliant Implementation* coming in next release. | For performance reasons, all groups get flattened into arrays. This means we lose group keys, which is where `matched` is meant to come from. Until then, `matched` exists, but it is always the flattened index, which is substantially less useful. |




## Example output

```ts
[
  {
    "key": "groups.md",
    "similarity": 1.0,
    "comparison": {
      "similarity": 1.0,
      "matches": 128,
      "distance": 0,
      "size": 128
    }
  },
  {
    "key": "compare.md",
    "similarity": 0.67,
    "comparison": {
      "similarity": 0.67,
      "matches": 86,
      "distance": 42,
      "size": 128
    }
  }
]
```



## See also

- [Query](./query.md)
- [Query options](./options.md)

