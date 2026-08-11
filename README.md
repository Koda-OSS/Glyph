![Glyph Banner](/docs/media/GlyphBanner.png)
[![ProductHunt](https://shieldcn.dev/badge/We're%20on-Product%20Hunt!-abcde3.svg?size=xs&logo=producthunt)](https://www.producthunt.com/products/glyph-8?launch=glyph-11)
[![Documentation](https://shieldcn.dev/badge/website-Koda%20Docs-EAA7C8.svg?variant=secondary&size=xs&logo=data%3Aimage%2Fsvg%2Bxml%2C%3Csvg+xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27+fill%3D%27none%27+viewBox%3D%270+0+24+24%27%3E%3Cpath+fill%3D%27%2523fff%27+d%3D%27M12+20.6C12+16+8.1+12+3.4+12v8.6m8.6+0c0-4.7+3.9-8.6+8.6-8.6v8.6M12+3.4C12+8+8.1+12+3.4+12V3.4m8.6+0C12+8+15.9+12+20.6+12V3.4%27%2F%3E%3C%2Fsvg%3E)](https://docs.koda.sh)
[![Website](https://shieldcn.dev/badge/website-Koda-9ED7E0.svg?variant=secondary&size=xs&logo=data%3Aimage%2Fsvg%2Bxml%2C%3Csvg+xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27+fill%3D%27none%27+viewBox%3D%270+0+24+24%27%3E%3Cpath+fill%3D%27%2523fff%27+d%3D%27M12+20.6C12+16+8.1+12+3.4+12v8.6m8.6+0c0-4.7+3.9-8.6+8.6-8.6v8.6M12+3.4C12+8+8.1+12+3.4+12V3.4m8.6+0C12+8+15.9+12+20.6+12V3.4%27%2F%3E%3C%2Fsvg%3E)](https://koda.sh)
[![Discord](https://shieldcn.dev/badge/discord-community-808BC3.svg?variant=secondary&size=xs&logo=discord)](https://discord.gg/Uc2Dnyb3Ej)
[![GitHub (koda oss)](https://shieldcn.dev/badge/github-Koda%20OSS-2C40FF.svg?variant=secondary&size=xs&logo=github)](https://github.com/Koda-OSS)
[![GitHub (koda sh)](https://shieldcn.dev/badge/github-Koda-2C40FF.svg?variant=secondary&size=xs&logo=github)](https://github.com/Koda-sh)

> Compare fast. Search in memory. Spotlight documents. Aggregate collections.

**Glyph** turns text into **glyphs** — fixed-size MinHash fingerprints. Compare similarity, search an in-memory index, rank document chunks with spotlight, pre-aggregate labeled examples into one glyph, or suggest the next word with completions.

## Install

```bash
npm install @koda.oss/glyph
```

Node.js 18 or newer.

## Quick start

```ts
import { Create, Compare } from "@koda.oss/glyph";

const a = Create("the quick brown fox jumps over the lazy dog");
const b = Create("the quick brown fox leaped over the lazy dog");

console.log(Compare(a, b).similarity); // ~0–1 Jaccard estimate
```

## Documentation

Full doc index: **[docs/README.md](./docs/README.md)** · [Changelog](./CHANGELOG.md) · [Migration 0.4 → 1.0](./docs/migration-0.4-to-1.0.md)

| Start here | Topic |
| --- | --- |
| [Getting started](./docs/getting-started.md) | Install, first compare, mental model |
| [Building an index](./docs/building-an-index.md) | Store glyphs and run `query.New(idx).Search()` |
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
