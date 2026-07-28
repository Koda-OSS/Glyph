# Serialize

Encode glyphs as portable strings; decode them back to `Glyph` values.

## `serialize(value)`

Accepts a `Glyph`, `GlyphSignature`, or `GlyphRecord`.

```ts
import { create, serialize } from "glyph-ts";

const record = create("some text");

serialize(record.glyph); // g1.<payload>
serialize(record);       // r1.<version>.<createdAt>.<payload>
serialize({
  version: record.version,
  glyph: record.glyph,
});                      // s1.<version>.<payload>
```

### Format

| Kind | Pattern |
| --- | --- |
| Glyph | `g1.<base64url>` |
| Signature | `s1.<version>.<base64url>` |
| Record | `r1.<version>.<createdAt>.<base64url>` |

The payload is the raw little-endian `Uint32Array` bytes, base64url-encoded.

## `deserialize(string)`

Always returns a `Glyph` (the fingerprint only). Metadata on records/signatures is not restored.

```ts
import { create, serialize, deserialize, compare } from "glyph-ts";

const record = create("some text");
const encoded = serialize(record);
const glyph = deserialize(encoded);

compare(record, glyph); // similarity: 1
```

## Errors

- Missing / malformed parts
- Unsupported format version
- Invalid base64 / non–multiple-of-4 payload length

## When to use

- Persist fingerprints in a DB / cache without storing source text
- Pass glyphs over the wire
- Diff or log compact signatures in demos and tooling
