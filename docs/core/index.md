![Glyph Ribbon](/docs/media/RibbonCore.png)

# Index

> Store glyphs under string keys with `index.New()`. Default mode uses LSH banding.

The index is an in-memory store. It does not persist to disk. Query and Collections both use this Core primitive.

## Create an index

```ts
import { index } from "@koda.oss/glyph";

// Default: LSH banding (mode: "bands")
const idx = index.New();

// Exact linear scan over all keys
const exact = index.New({ mode: "direct" });

// Custom band layout (bands * rows must equal glyph size)
const custom = index.New({ bands: 16, rows: 8 });
```

| Option | Default | Meaning |
| --- | --- | --- |
| `mode` | `"bands"` | `"bands"` (LSH) or `"direct"` (exact scan) |
| `bands` | `64` when size is 128 | Number of LSH bands |
| `rows` | `2` when size is 128 | Rows per band (`bands * rows === glyphSize`) |
| `glyphSize` | locked on first insert | Expected signature length |

For glyph sizes other than 128, pass `bands` and/or `rows` (or `mode: "direct"`).

## Methods

| Method | Signature | Behavior |
| --- | --- | --- |
| `mode` | `GlyphIndexMode` | `"bands"` or `"direct"` (readonly) |
| `Get` | `(key) => Glyph \| GlyphGroup \| undefined` | Read entry |
| `Set` | `(key, glyphs?) => void` | Write entry; omit `glyphs` to delete key |
| `Add` | `(key, glyphs) => void` | Append glyphs; create key if missing |
| `Remove` | `(key) => void` | Delete key |
| `Has` | `(key) => boolean` | Key exists |
| `Clear` | `() => void` | Remove all keys |
| `Size` | `() => number` | Key count |
| `Keys` | `() => IterableIterator<string>` | All keys |
| `Values` | `() => IterableIterator<Glyph \| GlyphGroup>` | All values |
| `Entries` | `() => IterableIterator<[string, Glyph \| GlyphGroup]>` | Key-value pairs |
| `CandidateKeys` | `(probe) => IterableIterator<string>` | Keys to compare for search |

## `CandidateKeys(probe)`

Used by `query.New(idx).Search()` to choose which keys to score.

| Mode | Behavior |
| --- | --- |
| `bands` | Union of LSH bucket hits for the probe glyph(s) |
| `direct` | Every stored key |

`Keys()` / `Entries()` always reflect the full store. Only search uses `CandidateKeys`.

## `Set(key, glyphs?)`

```ts
idx.Set("doc", Create("text").glyph);
idx.Set("doc", [glyphA, glyphB]); // stored as { "0": glyphA, "1": glyphB }
idx.Set("doc"); // deletes "doc"
```

Values may be `Glyph`, `Glyph[]`, or `Record<string, Glyph>`. Arrays and records are normalized to a map on write. The index does **not** accept raw strings (call `Create()` first).

`Get()` always returns a bare `Glyph` or a **map** group — never an array.

## `Add(key, glyphs)` promotion

| Existing value | You `Add` | Result |
| --- | --- | --- |
| (missing) | one glyph | that glyph |
| (missing) | many glyphs | map group |
| single `Glyph` | more glyphs | `{ "0": old, "1": … }` |
| map group | more glyphs | merged map; new keys `"0"`, `"1"`, … (skip collisions) |

```ts
idx.Set("doc", glyphA);
idx.Add("doc", glyphB);
// Get("doc") === { "0": glyphA, "1": glyphB }
```

## Banding notes

- Default `64 × 2` on size-128 glyphs favors recall for typical thresholds.
- Stronger near-duplicate search: raise `rows` (e.g. `{ bands: 32, rows: 4 }` or `{ bands: 16, rows: 8 }`).
- Banding can miss weak true matches (false negatives). Use `mode: "direct"` when you need exhaustive scoring.

## Related

<!-- glyph-related:start -->
- [Collections](../collections/collection.md)
- [Completions chain](../completions/chain.md)
- [Building an index](../building-an-index.md)
- [Query](../query/query.md)
- [Create](./create.md)
<!-- glyph-related:end -->

_Related links ranked by [Glyph](https://github.com/Koda-OSS/Glyph)._
