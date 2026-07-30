![Glyph Ribbon](/docs/media/RibbonGlyph.png)

# Serialize

> Encode a glyph as a portable string. Decode back to a `Glyph`.

## `Serialize(value)`

Accepts `Glyph`, `GlyphSignature`, or `GlyphRecord`.

```ts
import { Create, Serialize } from "glyph-ts";

const record = Create("some text");

Serialize(record.glyph); // g1.<payload>
Serialize(record);       // r1.<version>.<createdAt>.<payload>
Serialize({
  version: record.version,
  glyph: record.glyph,
});                      // s1.<version>.<payload>
```

## String formats

| Kind | Pattern | Example prefix |
| --- | --- | --- |
| Glyph | `g1.<base64url>` | `g1.` |
| Signature | `s1.<version>.<base64url>` | `s1.1.` |
| Record | `r1.<version>.<createdAt>.<base64url>` | `r1.1.1710...` |

Payload = raw little-endian `Uint32Array` bytes, base64url-encoded.

## `Deserialize(string)`

Always returns a **`Glyph`**. Metadata on records and signatures is not restored.

```ts
import { Create, Serialize, Deserialize, Compare } from "glyph-ts";

const record = Create("some text");
const glyph = Deserialize(Serialize(record));

Compare(record, glyph); // similarity: 1
```

## Errors

| Condition | Result |
| --- | --- |
| Malformed string | Throws |
| Unsupported format version | Throws |
| Invalid base64 or bad byte length | Throws |

## Use cases

| Case | Action |
| --- | --- |
| Database cache | Store encoded glyph, skip source text |
| Wire transfer | Send compact fingerprint string |
| Logging | Print signature without hex dumps |

## See also

- [Glyph](./glyph.md)
- [Create](./create.md)
