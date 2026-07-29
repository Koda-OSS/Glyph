# Query options

> Control ranking, filtering, and compare behavior for `query()`.

```ts
interface GlyphQueryOptions {
  limit?: number;
  threshold?: number;
  normalize?: boolean;
  aggregate?: GroupAggregate;
  compare?: GlyphComparisonOptions;
}
```

## `limit`

Maximum number of results returned **after** sort.

| Value | Behavior |
| --- | --- |
| omitted | Return all results that pass `threshold` |
| `N` | Return top `N` hits |

## `threshold`

Minimum **raw** similarity (before `normalize`) to include a result.

| Value | Default |
| --- | --- |
| omitted | `0` (include all non-negative scores) |

Use a higher threshold to drop weak matches. Short queries against long documents often produce low absolute scores; `threshold: 0` with `normalize: true` is common for ranking demos.

## `normalize`

After sort (and `limit`), divide each `similarity` by the top score.

| Value | Behavior |
| --- | --- |
| `false` (default) | Raw MinHash estimate |
| `true` | Best hit → `1.0`; others scaled proportionally |

Skipped when:

- No results remain, or
- Top score is `0`

`comparison.similarity` inside each result is updated to match.

## `aggregate`

Group aggregate used when an index entry (or the probe) is a `GlyphGroup`. Default: `GroupAggregateMax` (max pairwise similarity).

```ts
import { query } from "glyph-ts";

query(probe, idx, {
  aggregate: ({ scores }) =>
    scores.reduce((a, b) => a + b, 0) / scores.length,
});
```

See [Groups](../core/groups.md).

## `compare`

Extra options forwarded to `compare()` for each entry.

```ts
query(probe, idx, {
  compare: {
    aggregate: GroupAggregateMax,
  },
});
```

If both `aggregate` and `compare.aggregate` are set, the top-level `aggregate` wins.

## Option interaction table

| Order | Step |
| --- | --- |
| 1 | Compare each entry (apply `aggregate` / `compare`) |
| 2 | Filter by `threshold` |
| 3 | Sort descending |
| 4 | Apply `limit` |
| 5 | Apply `normalize` (if `true`) |

## See also

- [Query](./query.md)
- [Query results](./results.md)
