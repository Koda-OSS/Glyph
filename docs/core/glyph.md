![Glyph Core](/docs/media/RibbonCore.png)

# Glyph

> A glyph is a fixed-size MinHash signature over text features.

A **glyph** is a `Uint32Array` tagged at the type level. It stores one MinHash fingerprint. You do not edit slots by hand.

## Related types

| Type | Fields | Use |
| --- | --- | --- |
| `Glyph` | `Uint32Array` | Raw fingerprint |
| `GlyphSignature` | `version`, `glyph` | Versioned fingerprint without timestamp |
| `GlyphRecord` | `version`, `glyph`, `createdAt` | Output of `Create()` |

```ts
type Glyph = Uint32Array & { readonly __glyph: true };

interface GlyphSignature {
  version: number;
  glyph: Glyph;
}

interface GlyphRecord extends GlyphSignature {
  createdAt: number;
}
```

## GlyphGroup

A **glyph group** is many glyphs treated as one entry for compare and query. The canonical form is a map:

```ts
type GlyphGroup = Record<string, Glyph>;
type GlyphGroupInput = GlyphGroup | Glyph[];
```

| Form | Example | Notes |
| --- | --- | --- |
| Map (canonical) | `{ title: glyphA, body: glyphB }` | Stored and returned shape |
| Array (input sugar) | `[glyphA, glyphB]` | Normalized to `{ "0": glyphA, "1": glyphB }` |

Pass either form at API boundaries. Internally, groups are always maps. `matched` values use numbers for pure-digit keys so array-style usage stays intuitive (`matched === 1` for index `1`).

## Rules

| Rule | Detail |
| --- | --- |
| Same options → same glyph | `Create()` is deterministic for `glyph` bytes |
| `createdAt` changes | Each `Create()` call gets a new timestamp |
| Compare needs equal `size` | Mismatched signature lengths throw |

## See also

- [Create](./create.md) — build a glyph from text
- [Compare](./compare.md) — score two glyphs
- [Groups](./groups.md) — score glyph collections
