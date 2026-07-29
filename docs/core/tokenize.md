# Tokenize

> Split text into tokens, unigrams, and vgrams.

Low-level helpers used by `create()`. Use them to debug or build a custom pipeline.

## Pipeline

```text
text
  → CreateTokens    (filter each word when normalize = true)
  → unigrams        (strip each token when normalize = true)
  → vgrams          (overlapping windows, strip each when normalize = true)
```

## Functions

```ts
import {
  CreateTokens,
  CreateUnigrams,
  CreateVGrams,
  tokenize,
} from "glyph-ts";

CreateTokens("Hello, world!");
CreateUnigrams("Hello, world!");
CreateVGrams("one two three four", 3);

tokenize("alpha beta gamma", { vgramSize: 2, normalize: true });
```

### `tokenize(text, options?)`

Returns all three lists:

```json
{
  "tokens": ["alpha,", "beta!", "gamma"],
  "unigrams": ["alpha", "beta", "gamma"],
  "vgrams": ["alphabeta", "betagamma"]
}
```

| Option | Default in `tokenize()` | Default in `create()` |
| --- | --- | --- |
| `vgramSize` | `2` | `4` |
| `normalize` | `true` | `true` |

> Pass the same `vgramSize` in `tokenize()` and `create()` when you need identical vgrams.

## Tokens

Word split on whitespace. Each token passes through `TextFilter` when `normalize` is `true`.

## Unigrams

One stripped token per word. See [Text normalization](./text-normalization.md).

## Vgrams

Overlapping word windows of width `vgramSize`, joined with a space, then stripped.

```ts
CreateVGrams("one two three four five", 3, true);
// ["onetwothree", "twothreefour", "threefourfive"]
```

| Condition | Vgram list |
| --- | --- |
| `tokens.length < vgramSize` | `[]` (empty) |
| Enough tokens | One stripped vgram per window |

Short text still fingerprints via tokens and unigrams inside `create()`.

## See also

- [Text normalization](./text-normalization.md)
- [Create](./create.md)
