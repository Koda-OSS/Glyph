![Glyph Spotlight](/docs/media/RibbonSpotlight.png)

# Spotlight

> Chunk a document, fingerprint each piece, rank against a probe.

`spotlight.New(content, options?)` compiles text into fingerprinted chunks. Call `Rank` or `Query` on the returned document.

## Create a document

```ts
import { Create, spotlight } from "glyph-ts";

const doc = spotlight.New(
  "Goodbye moon under quiet stars. Pasta recipe with tomato. Goodbye moon again.",
);

console.log(doc.Size()); // chunk count
```

| Option | Default | Meaning |
| --- | --- | --- |
| `chunker` | sentence / 128-word | `(text) => string[]` |
| `create` | `{}` | Forwarded to `Create()` per chunk |
| `normalize` | from `create` | Convenience override for create |
| `aggregate` | `GroupResultAggregatorSum` | Used when probe is a group |
| `textOutput` | `false` | Rank/Query return `string[]` when true |

## Default chunker

Flushes a chunk when either:

1. A sentence boundary is hit (`.`, `!`, `?`, or `;`), or
2. The current chunk reaches **128 words**

Pass `chunker` to replace this entirely.

## Methods

| Method | Behavior |
| --- | --- |
| `Rank(probe, options?)` | Score every chunk; sort by score descending |
| `Query(probe, options?)` | Same as Rank, then filter by `threshold` / `limit` |
| `Chunks()` | Snapshot of compiled chunks (`text`, `glyph`, `length`) |
| `Size()` | Number of compiled chunks |

Both `Rank` and `Query` return `GlyphSpotlightResult[]` by default. With `textOutput: true`, they return `string[]` (chunk text only, same order).

## See also

- [Your first spotlight](../your-first-spotlight.md)
- [Rank](./rank.md)
- [Query](./query.md)
