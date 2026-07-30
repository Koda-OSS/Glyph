![Glyph Core](/docs/media/RibbonCore.png)

# Text normalization

> Filter tokens. Strip unigrams and vgrams.

Two helpers control how text becomes features.

## `TextFilter(text)`

Used on **tokens** (words).

| Step | Rule |
| --- | --- |
| 1 | Lowercase |
| 2 | Remove characters outside the allowed set |

Allowed characters include letters, digits, common punctuation, and space.

```ts
TextFilter("Hello, World!"); // "hello, world!"
TextFilter("A-B_C");         // "a-b_c"
```

## `TextStrip(text)`

Used on **unigrams** and **vgrams**.

| Step | Rule |
| --- | --- |
| 1 | Run `TextFilter` |
| 2 | Keep letters and digits only (drop spaces and punctuation) |

```ts
TextStrip("Hello, World!"); // "helloworld"
TextStrip("foo-bar baz 123"); // "foobarbaz123"
```

## When each runs

| Feature type | Helper | `normalize: false` |
| --- | --- | --- |
| Token | `TextFilter` | Raw split words |
| Unigram | `TextStrip` | Raw tokens |
| Vgram | `TextStrip` on joined window | Raw joined window |

Set `normalize: false` in `create()` or `tokenize()` to skip both helpers.

## See also

- [Tokenize](./tokenize.md)
- [Create](./create.md)
