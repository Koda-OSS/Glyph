![Glyph Completions](/docs/media/RibbonCompletions.png)

# Completion options

> Configure chain creation and `Complete()` behavior.

## Chain options (`completions.New`)

```ts
interface GlyphCompletionChainOptions {
  order?: number;               // default 3
  create?: GlyphCreateOptions;  // forwarded to Create()
}
```

| Field | Default | Effect |
| --- | --- | --- |
| `order` | `3` | Markov order; state uses previous `order - 1` tokens |
| `create.size` | `128` | Signature length for document and probe glyphs |
| `create.vgramSize` | `4` | Vgram width inside `Create()` |
| `create.normalize` | `true` | Same strip path for ingest and complete tokens |

### Order examples

| `order` | State before `"farewell"` in `"goodbye moon farewell"` |
| --- | --- |
| `1` | `""` (empty) |
| `2` | `"moon"` |
| `3` (default) | `"goodbye moon"` |

## Complete options (`Complete`)

```ts
interface GlyphCompletionOptions {
  limit?: number;    // default 5
  minCount?: number; // default 1
}
```

| Field | Default | Effect |
| --- | --- | --- |
| `limit` | `5` | Max results returned after sort |
| `minCount` | `1` | Drop transitions seen fewer than N times |

## Related

<!-- glyph-related:start -->
- [Create](../core/create.md)
- [Completion results](./results.md)
- [Spotlight rank](../spotlight/rank.md)
- [Collections](../collections/collection.md)
- [Completions chain](./chain.md)
<!-- glyph-related:end -->

_Related links ranked by [Glyph](https://github.com/Koda-OSS/Glyph)._
