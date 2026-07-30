![Glyph Ribbon](/docs/media/RibbonGlyph.png)

# Getting started

> Fingerprint text. Compare similarity in one call.

GlyphTS builds **MinHash** signatures from text. You use `Create()` to fingerprint, then `Compare()` to score overlap.

## Install

```typescript
// NPM release coming soon! You can copy src into your project if you'd like.
```

Node.js 18 or newer is required.

## First compare

```ts
import { Create, Compare } from "glyph-ts";

const a = Create("the quick brown fox jumps over the lazy dog");
const b = Create("the quick brown fox leaped over the lazy dog");

const { similarity, distance, matches, size } = Compare(a, b);
```

| Field | Range / type | Meaning |
| --- | --- | --- |
| `similarity` | `0`–`1` | Estimated Jaccard similarity |
| `matches` | integer | Matching signature slots |
| `distance` | integer | `size - matches` |
| `size` | integer | Signature length |

## Mental model

1. **Tokenize** input text into words.
2. Build a feature bag: **tokens**, **unigrams**, **vgrams**.
3. Run **bag MinHash** to produce a `Uint32Array` (**glyph**).
4. **Compare** glyphs by counting equal slots.

Identical normalized text gives `similarity: 1`. Unrelated text is near `0`.

## What `Create` returns

```json
{
  "version": 1,
  "glyph": "<Uint32Array>",
  "createdAt": 1710000000000
}
```

- `version` — create pipeline version.
- `glyph` — the fingerprint bytes.
- `createdAt` — milliseconds since epoch (changes each call).

You can pass a full record or `record.glyph` into `Compare` and `Serialize`.

## Next steps

| Goal | Doc |
| --- | --- |
| Store many glyphs and search | [Building an index](./building-an-index.md) |
| Suggest the next word | [Your first completion](./your-first-completion.md) |
| All exports | [API surface](./api-surface.md) |
| Fingerprint options | [Create](./core/create.md) |
| Group compare | [Groups](./core/groups.md) |
