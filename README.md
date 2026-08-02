![Glyph Banner](/docs/media/GlyphBanner.png)

> Compare fast. Search in memory. Spotlight documents. Aggregate collections.

**GlyphTS** turns text into **glyphs** — fixed-size MinHash fingerprints. Compare similarity, search an in-memory index, rank document chunks with spotlight, pre-aggregate labeled examples into one glyph, or suggest the next word with completions.

## Install

```bash
npm install glyph-ts
```

Node.js 18 or newer.

## Quick start

```ts
import { Create, Compare } from "glyph-ts";

const a = Create("the quick brown fox jumps over the lazy dog");
const b = Create("the quick brown fox leaped over the lazy dog");

console.log(Compare(a, b).similarity); // ~0–1 Jaccard estimate
```

## Documentation

Full doc index: **[docs/README.md](./docs/README.md)** · [Changelog](./CHANGELOG.md)

| Start here | Topic |
| --- | --- |
| [Getting started](./docs/getting-started.md) | Install, first compare, mental model |
| [Building an index](./docs/building-an-index.md) | Store glyphs and run `query()` |
| [Your first collection](./docs/your-first-collection.md) | Aggregate examples into `col.glyph` |
| [Your first spotlight](./docs/your-first-spotlight.md) | Chunk and rank document snippets |
| [Demo CLI](./docs/demo.md) | Try modes from the terminal |
| [API surface](./docs/api-surface.md) | Every public export |

### License

Mozilla Public License 2.0 — see [LICENCE](./LICENCE).

<div align="center">
  <table>
    <tr>
      <td colspan="3" align="center">
        <a href="https://docs.koda.sh/?alias=glyph">
          <img src="/docs/media/FooterBanner.png" alt="View Glyph docs on Koda" width="800">
        </a>
      </td>
    </tr>
    <tr>
      <td align="center">
        <a href="https://discord.gg/Uc2Dnyb3Ej">
          <img src="/docs/media/FooterDiscord.png" alt="Discord">
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/Koda-OSS">
          <img src="/docs/media/FooterGithub.png" alt="Github">
        </a>
      </td>
      <td align="center">
        <a href="https://Koda.sh">
          <img src="/docs/media/FooterKoda.png" alt="Koda">
        </a>
      </td>
    </tr>
  </table>
</div>
