![Glyph Query](/docs/media/RibbonQuery.png)

# Query results

> Shape of each hit returned by `Search()`.

```ts
interface GlyphQueryResult {
  key: string;
  similarity: number;
  comparison: GlyphComparisonResult;
  matched?: string | number;
}
```

## Fields

| Field | Type | Meaning |
| --- | --- | --- |
| `key` | `string` | Index key for this entry |
| `similarity` | `number` | Score for ranking (`0`–`1`, or normalized) |
| `comparison` | `GlyphComparisonResult` | Full compare output for this pair |
| `matched` | `string \| number` | Winning member key when the index value is a group |

## `matched`

Present when the index entry is a **group**. It is the winning member on the index side (`comparison.matchedRight`).

| How the group was passed | Example `matched` |
| --- | --- |
| Array `[pasta, moon]` (index `1` wins) | `1` (number) |
| Map `{ noise: pasta, hit: moon }` | `"hit"` (string) |

Pure-digit map keys are coerced to numbers so array-style usage stays intuitive. Named keys stay strings.

## `comparison` object

```json
{
  "similarity": 0.35,
  "matches": 45,
  "distance": 83,
  "size": 128,
  "matchedLeft": 0,
  "matchedRight": "hit"
}
```

Same fields as [Compare](../core/compare.md). When `normalize: true`, `comparison.similarity` matches the result-level `similarity` after scaling.

## Sort order

Results are sorted by `similarity` descending. Index iteration order does not affect rank.

## Empty results

`Search()` returns `[]` when:

- The index has no keys, or
- Every entry is below `threshold`

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
    "key": "article",
    "similarity": 0.67,
    "matched": "body",
    "comparison": {
      "similarity": 0.67,
      "matches": 86,
      "distance": 42,
      "size": 128,
      "matchedRight": "body"
    }
  }
]
```

## See also

- [Query](./query.md)
- [Query options](./options.md)
- [Groups](../core/groups.md)
