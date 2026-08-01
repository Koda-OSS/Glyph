![Glyph Ribbon](/docs/media/RibbonCore.png)

# Index

> Store glyphs under string keys with `index.new()`. Default mode uses LSH banding.

The index is an in-memory store. It does not persist to disk. Query and Collections both use this Core primitive.

## Create an index

```ts
import { index } from "glyph-ts";

// Default: LSH banding (mode: "bands")
const idx = index.new();

// Exact linear scan over all keys
const exact = index.new({ mode: "direct" });

// Custom band layout (bands * rows must equal glyph size)
const custom = index.new({ bands: 16, rows: 8 });
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
| `get` | `(key) => Glyph \| GlyphGroup \| undefined` | Read entry |
| `set` | `(key, glyphs?) => void` | Write entry; omit `glyphs` to delete key |
| `add` | `(key, glyphs) => void` | Append glyphs; create key if missing |
| `remove` | `(key) => void` | Delete key |
| `has` | `(key) => boolean` | Key exists |
| `clear` | `() => void` | Remove all keys |
| `size` | `() => number` | Key count |
| `keys` | `() => IterableIterator<string>` | All keys |
| `values` | `() => IterableIterator<Glyph \| GlyphGroup>` | All values |
| `entries` | `() => IterableIterator<[string, Glyph \| GlyphGroup]>` | Key-value pairs |
| `candidateKeys` | `(probe) => IterableIterator<string>` | Keys to compare for search |

## `candidateKeys(probe)`

Used by `query()` to choose which keys to score.

| Mode | Behavior |
| --- | --- |
| `bands` | Union of LSH bucket hits for the probe glyph(s) |
| `direct` | Every stored key |

`keys()` / `entries()` always reflect the full store. Only search uses `candidateKeys`.

## `set(key, glyphs?)`

```ts
idx.set("doc", Create("text").glyph);
idx.set("doc", [glyphA, glyphB]); // stored as { "0": glyphA, "1": glyphB }
idx.set("doc"); // deletes "doc"
```

Values may be `Glyph`, `Glyph[]`, or `Record<string, Glyph>`. Arrays and records are normalized to a map on write. The index does **not** accept raw strings (call `Create()` first).

`get()` always returns a bare `Glyph` or a **map** group — never an array.

## `add(key, glyphs)` promotion

| Existing value | You `add` | Result |
| --- | --- | --- |
| (missing) | one glyph | that glyph |
| (missing) | many glyphs | map group |
| single `Glyph` | more glyphs | `{ "0": old, "1": … }` |
| map group | more glyphs | merged map; new keys `"0"`, `"1"`, … (skip collisions) |

```ts
idx.set("doc", glyphA);
idx.add("doc", glyphB);
// get("doc") === { "0": glyphA, "1": glyphB }
```

## Banding notes

- Default `64 × 2` on size-128 glyphs favors recall for typical thresholds.
- Stronger near-duplicate search: raise `rows` (e.g. `{ bands: 32, rows: 4 }` or `{ bands: 16, rows: 8 }`).
- Banding can miss weak true matches (false negatives). Use `mode: "direct"` when you need exhaustive scoring.

## See also

- [Building an index](../building-an-index.md)
- [Query](../query/query.md)
- [Groups](./groups.md)
