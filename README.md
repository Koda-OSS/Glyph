![Glyph Banner](/docs/media/GlyphBanner.png)

> MinHash fingerprints for text. Compare fast. Search in memory.

GlyphTS turns text into **glyphs** (fixed-size signatures). You can compare two glyphs, build an in-memory **index** and **query** it for ranked matches, or use **completions** for glyph-guided next-word suggestions.

![Glyph Ribbon](/docs/media/RibbonGlyph.png)

| Doc | Purpose |
| --- | --- |
| [Getting started](./docs/getting-started.md) | Install, first compare, mental model |
| [Building an index](./docs/building-an-index.md) | Populate an index and run a query |
| [Demo CLI](./docs/demo.md) | Compare, search, and complete from the terminal |
| [API surface](./docs/api-surface.md) | Full export list (Core + Query + Completions) |

![Glyph Core](/docs/media/RibbonCore.png)

| Doc | Topic |
| --- | --- |
| [Glyph](./docs/core/glyph.md) | Types: `Glyph`, `GlyphRecord`, `GlyphSignature` |
| [Create](./docs/core/create.md) | `Create()` and fingerprint options |
| [Compare](./docs/core/compare.md) | `Compare()`, `CompareGlyphs()`, results |
| [Groups](./docs/core/groups.md) | `GlyphGroup`, `CreateGroup()`, aggregate compare |
| [Serialize](./docs/core/serialize.md) | `Serialize()`, `Deserialize()`, string formats |
| [Tokenize](./docs/core/tokenize.md) | Tokens, unigrams, vgrams |
| [Text normalization](./docs/core/text-normalization.md) | `TextFilter`, `TextStrip` |

![Glyph Query](/docs/media/RibbonQuery.png)

| Doc | Topic |
| --- | --- |
| [Index](./docs/query/index.md) | `index.new()`, store and manage entries |
| [Query](./docs/query/query.md) | `query()` ranked search |
| [Query options](./docs/query/options.md) | `limit`, `threshold`, `normalize`, `aggregate` |
| [Query results](./docs/query/results.md) | `GlyphQueryResult` shape |

![Glyph Completions](/docs/media/RibbonCompletions.png)

| Doc | Topic |
| --- | --- |
| [Chain](./docs/docs/completions/chain.md) | `completions.new()`, ingest, storage |
| [Complete](./docs/completions/complete.md) | `complete()` ranked next-word suggestions |
| [Completion options](./docs/completions/options.md) | `order`, `create`, `limit`, `minCount` |
| [Completion results](./docs/completions/results.md) | `GlyphCompletionResult` shape |

### Limits (current version)

| Feature | Status |
| --- | --- |
| In-memory index | Implemented |
| Linear scan query | Implemented |
| Glyph completions (Markov + rank) | Implemented |
| Disk persistence | Not implemented |
| Approximate nearest neighbor (ANN) | Not implemented |
| Chain persistence | Not implemented |
| `matched` on query results | Not documented (spec not met) |

### License

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