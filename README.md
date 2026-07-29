![Glyph Banner](/docs/media/GlyphBanner.png)

MinHash text fingerprints ("glyphs") for fast similarity comparison.

**Docs:** [docs/README.md](./docs/README.md)

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

Mozilla Public Licence Version 2.0

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
        <a href="https://github.com/Koda-OSS">
          <img src="/docs/media/footerGithub.png" alt="GitHub">
        </a>
      </td>
      <td align="center">
        <a href="https://koda.sh">
          <img src="/docs/media/FooterKoda.png" alt="Koda">
        </a>
      </td>
      <td align="center">
        <a href="https://discord.gg/Uc2Dnyb3Ej">
          <img src="/docs/media/footerDiscord.png" alt="Discord">
        </a>
      </td>
    </tr>
  </table>
</div>