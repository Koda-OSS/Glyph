# GlyphTS

MinHash text fingerprints ("glyphs") for fast similarity comparison.

## Install

```bash
npm install glyph-ts
```

## Usage

```ts
import { Create, Compare } from "glyph-ts";

const a = Create("the quick brown fox jumps over the lazy dog");
const b = Create("the quick brown fox leaped over the lazy dog");

const { similarity, distance, matches } = Compare(a, b);

console.log(similarity); // ~0–1 Jaccard estimate
console.log(distance);   // mismatched signature slots
console.log(matches);    // matching signature slots
```

### Options

```ts
const glyph = Create(text, {
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
import { CreateTokens, CreateUnigrams, CreateVGrams, Tokenize } from "glyph-ts";

CreateTokens("Hello, world!");           // filter each token
CreateUnigrams("Hello, world!");         // strip each unigram
CreateVGrams("one two three four", 3);   // strip each vgram
Tokenize("alpha beta gamma", { vgramSize: 2 });
```

- **TextFilter** (tokens): lowercase, drop special characters / punctuation, keep letters + numbers
- **TextStrip** (unigrams / vgrams): lowercase, drop spaces / punctuation / special characters, keep letters + numbers

### Demo

```bash
npm run demo -- ./doc-a.txt ./doc-b.txt
```

## Development

```bash
npm install
npm run build
npm test
npm run typecheck
```

| Script | Description |
| --- | --- |
| `npm run build` | Bundle ESM + CJS + type declarations |
| `npm run dev` | Watch mode rebuild |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Type-check without emitting |

## License

Mozilla Public Licence Version 2.0
