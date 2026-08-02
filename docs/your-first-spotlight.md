![Glyph Spotlight](/docs/media/RibbonSpotlight.png)

# Your first spotlight

> Chunk a document. Rank snippets against a probe glyph.

Spotlight compiles one document into fingerprinted chunks, then scores each chunk against a probe. Use **Rank** to inspect every chunk, or **Query** to filter by threshold.

## What you will build

1. Create a spotlight document from text.
2. Rank chunks against a probe glyph.
3. Query with a threshold and limit.
4. Optionally return plain strings with `textOutput`.

## Create a document

```ts
import { spotlight } from "glyph-ts";

const doc = spotlight.New(
  "Goodbye moon under quiet stars. Pasta recipe with tomato. Goodbye moon again.",
);

console.log(doc.Size()); // number of chunks
```

## Rank all chunks

```ts
import { Create, spotlight } from "glyph-ts";

const doc = spotlight.New("...");
const probe = Create("Goodbye moon under quiet stars").glyph;

const results = doc.Rank(probe);

for (const hit of results) {
  console.log(hit.score.toFixed(2), hit.text);
}
```

Each result is a `GlyphSpotlightResult` with `text`, `glyph`, `score`, and `comparison`.

## Query with threshold

```ts
const hits = doc.Query(probe, {
  threshold: 0.15,
  limit: 5,
});
```

## Group probes

Pass a `GlyphGroup` to match multiple examples (emails, URLs, phrases):

```ts
import { CreateGroup } from "glyph-ts";

const hits = doc.Query(
  CreateGroup(["user@example.com", "support@example.com"]),
  { threshold: 0.2, limit: 10 },
);
```

Group probes use `GroupResultAggregatorSum` by default.

## textOutput

Return chunk text only, sorted by score:

```ts
const snippets = doc.Query(probe, {
  threshold: 0.1,
  limit: 3,
  textOutput: true,
});
// string[]
```

## Try it in the terminal

```bash
npm run demo -- spotlight ./docs/core/index.md "LSH banding"
```

## See also

- [Spotlight document](./spotlight/document.md)
- [Rank](./spotlight/rank.md)
- [Query](./spotlight/query.md)
- [Demo CLI](./demo.md)
