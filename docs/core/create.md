![Glyph Ribbon](/docs/media/RibbonGlyph.png)

# Create

> Turn text into a glyph record with `Create()`.

`Create(text, options?)` tokenizes input, builds a feature bag, and runs bag MinHash.

## Usage

```ts
import { Create } from "glyph-ts";

const record = Create("hello world", {
  size: 128,
  vgramSize: 4,
  normalize: true,
});
```

## Options

| Option | Default | Meaning |
| --- | --- | --- |
| `size` | `128` | Number of MinHash slots |
| `vgramSize` | `4` | Word n-gram width for vgrams |
| `normalize` | `true` | Apply filter/strip pipeline |

Larger `size` gives a more stable estimate and a larger payload. Larger `vgramSize` favors phrase overlap; short text may produce zero vgrams (unigrams still contribute).

## Feature bag

Each glyph hashes three feature sets:

```text
tokens   → filtered words
unigrams → stripped tokens
vgrams   → stripped overlapping word windows (width = vgramSize)

bag = [...tokens, ...unigrams, ...vgrams]
glyph = bagMinHash(bag, size)
```

| Stage | Helper | Doc |
| --- | --- | --- |
| Tokens | `CreateTokens` | [Tokenize](./tokenize.md) |
| Unigrams | unigrams from tokens | [Tokenize](./tokenize.md) |
| Vgrams | vgrams from tokens | [Tokenize](./tokenize.md) |

## Return value

```json
{
  "version": 1,
  "glyph": "<Uint32Array length = size>",
  "createdAt": 1710000000000
}
```

`version` is the create pipeline version (currently `1`).

## Errors

| Condition | Result |
| --- | --- |
| `size < 1` | Throws |
| `vgramSize < 1` | Throws |

## See also

- [Glyph](./glyph.md)
- [Tokenize](./tokenize.md)
- [Text normalization](./text-normalization.md)
