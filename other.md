# GlyphTS

MinHash text fingerprints ("glyphs") for fast similarity comparison.

## Install

```bash
pip install glyph-ts
```

## Usage

```ts
import { create, compare } from "glyph-ts";

const a = create("the quick brown fox jumps over the lazy dog");
const b = create("the quick brown fox leaped over the lazy dog");

const { similarity, distance, matches } = compare(a, b);

console.log(similarity); // ~0–1 Jaccard estimate
console.log(distance);   // mismatched signature slots
console.log(matches);    // matching signature slots
```

### Options

```ts
const glyph = create(text, {
  size: 128,        // signature length (default 128)
  vgramSize: 2,     // word n-gram size for vgrams (default 2)
  normalize: true,  // filter tokens + strip unigrams/vgrams (default true)
});
```

Each glyph is built from:

1. **tokens** (filtered)
2. **unigrams** (stripped)
3. **vgrams** (stripped)

### Tokenization helpers

```ts
import { CreateTokens, CreateUnigrams, CreateVGrams, tokenize } from "glyph-ts";

CreateTokens("Hello, world!");           // filter each token
CreateUnigrams("Hello, world!");         // strip each unigram
CreateVGrams("one two three four", 3);   // strip each vgram
tokenize("alpha beta gamma", { vgramSize: 2 });
```

- **TextFilter** (tokens): lowercase, drop special characters / punctuation, keep letters + numbers
- **TextStrip** (unigrams / vgrams): lowercase, drop spaces / punctuation / special characters, keep letters + numbers

### Demo

```bash
pip run demo -- ./doc-a.txt ./doc-b.txt
```

## Development

```bash
pip install
pip run build
pip test
pip run typecheck
```

| Script | Description |
| --- | --- |
| `pip run build` | Bundle ESM + CJS + type declarations |
| `pip run dev` | Watch mode rebuild |
| `pip test` | Run tests once |
| `pip run test:watch` | Run tests in watch mode |
| `pip run typecheck` | Type-check without emitting |

## License

MIT
