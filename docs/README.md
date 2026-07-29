# Glyph Documentation

![Glyph Banner](/docs/media/GlyphBanner.png)


> MinHash fingerprints for text. Compare fast. Search in memory.

GlyphTS turns text into **glyphs** (fixed-size signatures). You can compare two glyphs, or build an in-memory **index** and **query** it for ranked matches.

## Start here

| Doc | Purpose |
| --- | --- |
| [Getting started](./getting-started.md) | Install, first compare, mental model |
| [Building an index](./building-an-index.md) | Populate an index and run a query |
| [API surface](./api-surface.md) | Full export list (Core + Query) |

## Core

| Doc | Topic |
| --- | --- |
| [Glyph](./core/glyph.md) | Types: `Glyph`, `GlyphRecord`, `GlyphSignature` |
| [Create](./core/create.md) | `create()` and fingerprint options |
| [Compare](./core/compare.md) | `compare()`, `GlyphDirectCompare()`, results |
| [Groups](./core/groups.md) | `GlyphGroup`, `createGroup()`, aggregate compare |
| [Serialize](./core/serialize.md) | `serialize()`, `deserialize()`, string formats |
| [Tokenize](./core/tokenize.md) | Tokens, unigrams, vgrams |
| [Text normalization](./core/text-normalization.md) | `TextFilter`, `TextStrip` |

## Query

| Doc | Topic |
| --- | --- |
| [Index](./query/index.md) | `index.new()`, store and manage entries |
| [Query](./query/query.md) | `query()` ranked search |
| [Query options](./query/options.md) | `limit`, `threshold`, `normalize`, `aggregate` |
| [Query results](./query/results.md) | `GlyphQueryResult` shape |

## Limits (current version)

| Feature | Status |
| --- | --- |
| In-memory index | Implemented |
| Linear scan query | Implemented |
| Disk persistence | Not implemented |
| Approximate nearest neighbor (ANN) | Not implemented |
| `matched` on query results | Not documented (spec not met) |

<div align="center">
  <table>
    <tr>
      <td colspan="3" align="center">
        <a href="https://docs.koda.sh/?alias=blit">
          <img src="/docs/media/FooterBanner.png" alt="View Blit docs on Koda" width="800">
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