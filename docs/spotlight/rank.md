![Glyph Spotlight](/docs/media/RibbonSpotlight.png)

# Spotlight rank

> Score every chunk in a compiled document against a probe.

```ts
import { Create, spotlight } from "@koda.oss/glyph";

const doc = spotlight.New(
  "Goodbye moon under quiet stars. Unrelated pasta recipe.",
);

const results = doc.Rank(Create("Goodbye moon under quiet stars").glyph);

for (const hit of results) {
  console.log(hit.score, hit.text);
}
```

## Result shape

```ts
interface GlyphSpotlightResult {
  text: string;
  glyph: Glyph;
  length: number;
  score: number;
  comparison: GlyphComparisonResult;
  matched?: string | number; // when probe is a group
}
```

Results are sorted by `score` descending. Every compiled chunk appears once (no threshold filter).

## Group probes

When the probe is a `GlyphGroup`, pairwise scores are aggregated with `GroupResultAggregatorSum` by default (sum of similarities). Pass `aggregate` to override (for example `GroupResultAggregatorMax`).

## textOutput

```ts
const texts = doc.Rank(probe, { textOutput: true });
// string[] — same order as full results
```

## Related

<!-- glyph-related:start -->
- [Spotlight](./document.md)
- [Your first spotlight](../your-first-spotlight.md)
- [Completion results](../completions/results.md)
- [Spotlight query](./query.md)
- [Collections](../collections/collection.md)
<!-- glyph-related:end -->

_Related links ranked by [Glyph](https://github.com/Koda-OSS/Glyph)._
