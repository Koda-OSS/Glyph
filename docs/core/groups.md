![Glyph Core](/docs/media/RibbonCore.png)

# Groups

> Compare many glyphs at once with aggregate scoring.

A **glyph group** is stored as `Record<string, Glyph>` (a map). You can still pass a `Glyph[]` anywhere a group is accepted — arrays are normalized invisibly to `{ "0": …, "1": … }`.

## Build a group

```ts
import { Create, CreateGroup } from "glyph-ts";

// from strings (calls Create internally) → { "0": glyph, "1": glyph }
const fromText = CreateGroup(["chunk one", "chunk two"]);

// from glyphs
const fromGlyphs = CreateGroup([
  Create("chunk one").glyph,
  Create("chunk two").glyph,
]);

// named members
const named = {
  title: Create("chunk one").glyph,
  body: Create("chunk two").glyph,
};
```

## Input vs storage

| You pass | Stored / returned as |
| --- | --- |
| `Glyph[]` | `{ "0": g0, "1": g1, … }` |
| `Record<string, Glyph>` | same map (shallow copy) |
| single `Glyph` (via `Compare`) | `{ "0": glyph }` |

You do not need to convert arrays yourself. Pass whichever form is convenient.

## `CompareGroups(group1, group2, options?)`

Explicit group compare. `Compare()` calls this when either side is a group.

```ts
import { CompareGroups, CreateGroup } from "glyph-ts";

CompareGroups(
  CreateGroup(["alpha beta", "gamma delta"]),
  CreateGroup(["gamma delta", "unrelated"]),
);
```

## Matched keys

Winning members are reported on `matchedLeft` / `matchedRight`:

| Origin key | `matched*` value |
| --- | --- |
| Array index `1` (stored as `"1"`) | number `1` |
| Named key `"title"` | string `"title"` |

```ts
const result = Compare(probe, [pasta, moon]);
result.matchedRight; // 1  — same as the array index you passed
```

## Default aggregate: max

```ts
import { GroupAggregateMax } from "glyph-ts";

// ({ scores }) => Math.max(...scores)
```

`[query] vs [a, b, c]` returns the best pairwise score. Use this for “does this text match any item in the set?”

## Sum aggregate

```ts
import { GroupAggregateSum } from "glyph-ts";

// ({ scores }) => scores.reduce((a, b) => a + b, 0)
```

Spotlight uses sum by default for group probes (multi-example evidence can exceed `1`).

## Custom aggregate

```ts
import { Compare } from "glyph-ts";
import type { GroupAggregate } from "glyph-ts";

const average: GroupAggregate = ({ scores }) =>
  scores.reduce((sum, n) => sum + n, 0) / scores.length;

Compare(groupA, groupB, { aggregate: average });
```

`GroupAggregateContext` receives **normalized maps** for `left` and `right` (keys preserved).

```json
{
  "scores": [0.1, 0.5, 0.3],
  "left": { "0": "<Glyph>", "1": "<Glyph>" },
  "right": { "title": "<Glyph>", "body": "<Glyph>" }
}
```

## How `Compare` wraps singles

A lone glyph passed against a group is wrapped as `{ "0": glyph }` before group logic runs. You do not need to wrap manually.

## See also

- [Compare](./compare.md)
- [Index](../core/index.md) — store groups per key
