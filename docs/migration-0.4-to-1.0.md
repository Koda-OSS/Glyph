# Migration: 0.4.x → 1.0.0

> Breaking API changes for Glyph 1.0.

## Summary

1. **Package rename** — install/import `@koda.oss/glyph` (was documented as `glyph-ts`)
2. **PascalCase** on all instance methods and factory `New()` calls
3. **Query wraps an index** — `query(probe, idx)` becomes `query.New(idx).Search(probe)`
4. Index module lives at `src/index/` (package barrel is `src/main.ts`)
5. Named error classes for common failures
6. Product branding is **Glyph** (not GlyphTS)

## Package rename

| 0.4.x | 1.0 |
| --- | --- |
| `npm install glyph-ts` | `npm install @koda.oss/glyph` |
| `import { … } from "glyph-ts"` | `import { … } from "@koda.oss/glyph"` |

Unscoped `glyph` is taken on npm; the scoped `@koda.oss/glyph` name is intentional.

## Factory renames

| 0.4.x | 1.0 |
| --- | --- |
| `index.new()` | `index.New()` |
| `collections.new()` | `collections.New()` |
| `completions.new()` | `completions.New()` |
| `spotlight.new()` | `spotlight.New()` |
| `query(probe, idx, options)` | `query.New(idx).Search(probe, options)` |

Namespace identifiers (`index`, `query`, `collections`, …) stay lowercase.

## Index methods

| 0.4.x | 1.0 |
| --- | --- |
| `get` | `Get` |
| `set` | `Set` |
| `add` | `Add` |
| `remove` | `Remove` |
| `has` | `Has` |
| `clear` | `Clear` |
| `size` | `Size` |
| `keys` | `Keys` |
| `values` | `Values` |
| `entries` | `Entries` |
| `candidateKeys` | `CandidateKeys` |

## Query

**Before:**

```ts
const idx = index.new();
idx.set("moon", Create("Goodbye moon").glyph);
const hits = query(Create("Goodbye moon").glyph, idx, { limit: 5 });
```

**After:**

```ts
const idx = index.New();
idx.Set("moon", Create("Goodbye moon").glyph);
const hits = query.New(idx).Search(Create("Goodbye moon").glyph, { limit: 5 });
```

## Completions

| 0.4.x | 1.0 |
| --- | --- |
| `ingest` | `Ingest` |
| `complete` | `Complete` |
| `clear` | `Clear` |
| `size` | `Size` |

## Spotlight

| 0.4.x | 1.0 |
| --- | --- |
| `rank` | `Rank` |
| `query` | `Query` |
| `chunks` | `Chunks` |
| `size` | `Size` |

Spotlight `Query` is document-chunk search — distinct from the top-level `query` module.

## Collections

Already PascalCase in 0.4.x (`Add`, `Remove`, `Collection`, …). Only the factory changes: `collections.New()`.

## Named errors

| Class | Typical cause |
| --- | --- |
| `GlyphSizeMismatchError` | Compare / index / collection size mismatch |
| `EmptyGroupError` | Empty group compare |
| `InvalidSerializedGlyphError` | Bad `Deserialize` input |

Happy-path APIs are unchanged; these replace generic `Error` for the cases above.

## Unchanged

- Core functions: `Create`, `Compare`, `Serialize`, aggregators, etc.
- Type names (`GlyphQueryResult`, `GlyphIndexInstance`, …)
- Persistence remains unimplemented (planned post-1.0)
