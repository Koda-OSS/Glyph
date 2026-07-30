![Glyph Core](/docs/media/RibbonCore.png)

# Groups

> Compare many glyphs at once with aggregate scoring.

A **glyph group** is `Glyph[]` or `Record<string, Glyph>`. Group compare scores every pair, then runs an **aggregate** function (default: **max**).

## Build a group

```ts
import { Create, CreateGroup } from "glyph-ts";

// from strings (calls Create internally)
const fromText = CreateGroup(["chunk one", "chunk two"]);

// from glyphs
const fromGlyphs = CreateGroup([
  Create("chunk one").glyph,
  Create("chunk two").glyph,
]);
```

## `CompareGroups(group1, group2, options?)`

Explicit group compare. `Compare()` calls this when either side is a group.

```ts
import { CompareGroups, CreateGroup } from "glyph-ts";

CompareGroups(
  CreateGroup(["alpha beta", "gamma delta"]),
  CreateGroup(["gamma delta", "unrelated"]),
);
```

## Default aggregate: max

```ts
import { GroupAggregateMax } from "glyph-ts";

// ({ scores }) => Math.max(...scores)
```

`[query] vs [a, b, c]` returns the best pairwise score. Use this for “does this text match any item in the set?”

## Custom aggregate

```ts
import { Compare } from "glyph-ts";
import type { GroupAggregate } from "glyph-ts";

const average: GroupAggregate = ({ scores }) =>
  scores.reduce((sum, n) => sum + n, 0) / scores.length;

Compare(groupA, groupB, { aggregate: average });
```

`GroupAggregateContext`:

```json
{
  "scores": [0.1, 0.5, 0.3],
  "left": "<GlyphGroup>",
  "right": "<GlyphGroup>"
}
```

## How `Compare` wraps singles

A lone glyph passed to `Compare()` is wrapped as a one-item array before group logic runs. You do not need to wrap manually.

## Record groups and internal flattening

`resolveGlyphsToArray()` turns record groups into `Object.values(group)`. Pairwise scoring uses that flat list. **Field names are not used during scoring.**

> Do not rely on record key names for match attribution until a future spec defines stable `matched` behavior.

## See also

- [Compare](./compare.md)
- [Index](../query/index.md) — store groups per key
