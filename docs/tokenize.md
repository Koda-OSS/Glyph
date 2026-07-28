# Tokenization

Lower-level helpers used by `create`. Useful for debugging or custom pipelines.

## Pipeline

```text
text
  → CreateTokens   (TextFilter each word, if normalize)
  → CreateUnigrams (TextStrip each token, if normalize)
  → CreateVGrams   (overlapping n-grams, TextStrip each, if normalize)
```

## Helpers

```ts
import {
  CreateTokens,
  CreateUnigrams,
  CreateVGrams,
  tokenize,
  TextFilter,
  TextStrip,
} from "glyph-ts";

CreateTokens("Hello, world!");
CreateUnigrams("Hello, world!");
CreateVGrams("one two three four", 3);

tokenize("alpha beta gamma", {
  vgramSize: 2,
  normalize: true,
});
// { tokens, unigrams, vgrams }
```

### `tokenize(text, options?)`

| Option | Default | Description |
| --- | --- | --- |
| `vgramSize` | `2`* | N-gram width for vgrams |
| `normalize` | `true` | Apply filter/strip |

\*Tokenize's default `vgramSize` may differ from `create`'s default — pass the same value when you care about parity.

## Filter vs strip

| Helper | Used on | Behavior |
| --- | --- | --- |
| `TextFilter` | tokens | Lowercase; remove characters outside an allowed set (keeps common punctuation) |
| `TextStrip` | unigrams / vgrams | Lowercase via filter, then keep **letters and digits only** (drops spaces & punctuation) |

```ts
TextFilter("Hello, World!"); // "hello, world!"
TextStrip("Hello, World!");  // "helloworld"
```

## VGrams

Overlapping word windows of length `vgramSize`, joined then stripped:

```ts
CreateVGrams("one two three four five", 3);
// ["onetwothree", "twothreefour", "threefourfive"]
```

If `tokens.length < vgramSize`, returns `[]` (unigrams still cover short text in `create`).
