# Glyph

> A glyph is a fixed-size MinHash signature over text features.

A **glyph** is a `Uint32Array` tagged at the type level. It stores one MinHash fingerprint. You do not edit slots by hand.

## Related types

| Type | Fields | Use |
| --- | --- | --- |
| `Glyph` | `Uint32Array` | Raw fingerprint |
| `GlyphSignature` | `version`, `glyph` | Versioned fingerprint without timestamp |
| `GlyphRecord` | `version`, `glyph`, `createdAt` | Output of `create()` |

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

A **glyph group** is many glyphs treated as one entry for compare and query.

```ts
type GlyphGroup = Glyph[] | Record<string, Glyph>;
```

| Form | Example |
| --- | --- |
| Array | `[glyphA, glyphB]` |
| Record | `{ title: glyphA, body: glyphB }` |

> Group compare flattens records with `Object.values()` internally. Named fields are not preserved during pairwise scoring.

## Rules

| Rule | Detail |
| --- | --- |
| Same options → same glyph | `create()` is deterministic for `glyph` bytes |
| `createdAt` changes | Each `create()` call gets a new timestamp |
| Compare needs equal `size` | Mismatched signature lengths throw |

## See also

- [Create](./create.md) — build a glyph from text
- [Compare](./compare.md) — score two glyphs
- [Groups](./groups.md) — score glyph collections
