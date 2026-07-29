# Index

> Store glyphs under string keys with `index.new()`.

The index is an in-memory `Map`. It does not persist to disk.

## Create an index

```ts
import { index } from "glyph-ts";

const idx = index.new();
```

## Methods

| Method | Signature | Behavior |
| --- | --- | --- |
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

## `set(key, glyphs?)`

```ts
idx.set("doc", create("text").glyph);
idx.set("doc"); // deletes "doc"
```

Values must be `Glyph`, `Glyph[]`, or `Record<string, Glyph>`. The index does **not** accept raw strings (call `create()` first).

## `add(key, glyphs)` promotion

| Existing value | You `add` | Result |
| --- | --- | --- |
| (missing) | one glyph | that glyph |
| (missing) | many glyphs | `Glyph[]` |
| single `Glyph` | more glyphs | `[old, ...added]` |
| `Glyph[]` | more glyphs | concatenated array |
| `Record<string, Glyph>` | glyphs | merged record; new keys `"0"`, `"1"`, … (skip collisions) |

```ts
idx.set("doc", glyphA);
idx.add("doc", glyphB);
// get("doc") === [glyphA, glyphB]
```

## Record vs array storage

Both forms are valid `GlyphGroup` values. Group compare flattens records with `Object.values()`. See [Groups](../core/groups.md).

## See also

- [Building an index](../building-an-index.md)
- [Query](./query.md)
