![Glyph Query](/docs/media/RibbonQuery.png)

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

## See also

- [Building an index](../building-an-index.md)
- [Query](./query.md)
- [Groups](../core/groups.md)
