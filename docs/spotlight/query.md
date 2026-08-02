![Glyph Spotlight](/docs/media/RibbonSpotlight.png)

# Spotlight query

> Rank chunks, then filter by threshold and limit.

Primary use case: feature extraction — probe with example glyphs (emails, URLs, etc.) and keep chunks that clear a threshold.

```ts
import { CreateGroup, spotlight } from "@koda.oss/glyph";

const doc = spotlight.New(longArticleText);

const hits = doc.Query(
  CreateGroup(["user@example.com", "https://example.com/path"]),
  { threshold: 0.2, limit: 10 },
);

for (const hit of hits) {
  console.log(hit.score, hit.text);
}
```

## Options

| Option | Default | Effect |
| --- | --- | --- |
| `threshold` | `0` | Drop results with `score < threshold` |
| `limit` | omitted | Keep at most N results after sort |
| `textOutput` | `false` | Return `string[]` instead of `GlyphSpotlightResult[]` |
| `aggregate` | sum | Group probe aggregate |
| `chunker` / `create` | — | Only apply at `spotlight.New` (ignored if passed only to Query) |

Compile-time options (`chunker`, `create`, `normalize`) belong on `spotlight.New`. Query-time options are `threshold`, `limit`, `textOutput`, and `aggregate`.

## textOutput

```ts
const snippets = doc.Query(probe, {
  threshold: 0.15,
  limit: 5,
  textOutput: true,
});
```

## Related

<!-- glyph-related:start -->
- [Your first spotlight](../your-first-spotlight.md)
- [Query](../query/query.md)
- [Spotlight rank](./rank.md)
- [Complete a prefix](../completions/complete.md)
- [Query options](../query/options.md)
<!-- glyph-related:end -->

_Related links ranked by [Glyph](https://github.com/Koda-OSS/Glyph)._
