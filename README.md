# GlyphTS

MinHash text fingerprints ("glyphs") for fast similarity comparison.

**Docs:** [docs/](./docs/README.md)

## Install

```bash
npm install glyph-ts
```

## Quick start

```ts
import { create, compare } from "glyph-ts";

const a = create("the quick brown fox jumps over the lazy dog");
const b = create("the quick brown fox leaped over the lazy dog");

const { similarity, distance, matches } = compare(a, b);
```

## License

MIT
