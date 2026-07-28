# Groups

Compare one glyph against many (or many against many) with aggregate scoring.

## `createGroup(glyphs)`

```ts
import { create, createGroup } from "glyph-ts";

// from strings (creates glyphs for you)
const group = createGroup([
  "totally unrelated pasta recipe",
  "Goodbye moon",
  "something else entirely",
]);

// from existing glyphs
const also = createGroup([
  create("one").glyph,
  create("two").glyph,
]);
```

A `GlyphGroup` is either:

- `Glyph[]`, or
- `Record<string, Glyph>` (named members)

## `compare` with groups

If **either** argument is a group, `compare` uses group compare:

```ts
import { create, createGroup, compare } from "glyph-ts";

const query = create("Goodbye moon").glyph;
const group = createGroup([
  "totally unrelated pasta recipe",
  "Goodbye moon",
  "something else entirely",
]);

compare(query, group); // → similarity 1 (best match)
```

## How group compare works

1. Expand both sides to glyph arrays.
2. Run `GlyphDirectCompare` on every pair.
3. Aggregate pairwise similarities with `GroupAggregate` (default: **max**).

```ts
import { GroupComparison, GroupAggregateMax } from "glyph-ts";

GroupComparison(groupA, groupB); // same as compare when both are groups
```

## Default aggregate: max

```ts
import { GroupAggregateMax } from "glyph-ts";

// ({ scores }) => Math.max(...scores)
```

So `[query] vs [a, b, c]` returns the best pairwise score — handy for “does this text match any document in the set?”

## Custom aggregate

```ts
import { compare, createGroup } from "glyph-ts";
import type { GroupAggregate } from "glyph-ts";

const average: GroupAggregate = ({ scores }) =>
  scores.reduce((sum, n) => sum + n, 0) / scores.length;

compare(createGroup(["a", "b"]), createGroup(["c", "d"]), {
  aggregate: average,
});
```

`GroupAggregateContext` provides:

```ts
{
  scores: number[];   // all pairwise similarities
  left: GlyphGroup;
  right: GlyphGroup;
}
```

The returned `GlyphComparisonResult` uses the aggregated `similarity`. Other fields (`matches`, `distance`, `size`) come from a pairwise result that matches that similarity when possible (typically the winning max pair).
