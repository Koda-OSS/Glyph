![Glyph Banner](/docs/media/GlyphBanner.png)

> Compare fast. Search in memory. Spotlight documents. Aggregate collections.

GlyphTS turns text into **glyphs** (fixed-size signatures). You can compare two glyphs, build an in-memory **index** and **query** it for ranked matches, use **spotlight** to rank chunks inside a document, or use **completions** for glyph-guided next-word suggestions.

![Glyph Ribbon](/docs/media/RibbonGlyph.png)

| Doc | Purpose |
| --- | --- |
| [Getting started](./getting-started.md) | Install, first compare, mental model |
| [Building an index](./building-an-index.md) | Populate an index and run a query |
| [Your first completion](./your-first-completion.md) | Ingest docs and suggest the next word |
| [Your first collection](./your-first-collection.md) | Aggregate labeled glyphs into one probe |
| [Your first spotlight](./your-first-spotlight.md) | Chunk a document and rank snippets |
| [Demo CLI](./demo.md) | Compare, search, complete, and spotlight from the terminal |
| [API surface](./api-surface.md) | Full export list (Core + Query + Collections + Completions + Spotlight) |

![Glyph Core](/docs/media/RibbonCore.png)

| Doc | Topic |
| --- | --- |
| [Glyph](./core/glyph.md) | Types: `Glyph`, `GlyphRecord`, `GlyphSignature` |
| [Create](./core/create.md) | `Create()` and fingerprint options |
| [Compare](./core/compare.md) | `Compare()`, `CompareGlyphs()`, results |
| [Groups](./core/groups.md) | `GlyphGroup`, `CreateGroup()`, aggregate compare |
| [Serialize](./core/serialize.md) | `Serialize()`, `Deserialize()`, string formats |
| [Tokenize](./core/tokenize.md) | Tokens, unigrams, vgrams |
| [Text normalization](./core/text-normalization.md) | `TextFilter`, `TextStrip` |
| [Index](./core/index.md) | `index.new()`, bands (default) or direct store |

![Glyph Query](/docs/media/RibbonQuery.png)

| Doc | Topic |
| --- | --- |
| [Query](./query/query.md) | `query()` ranked search |
| [Query options](./query/options.md) | `limit`, `threshold`, `normalize`, `aggregate` |
| [Query results](./query/results.md) | `GlyphQueryResult` shape |

![Glyph Collections](/docs/media/RibbonCollections.png)

| Doc | Topic |
| --- | --- |
| [Collections](./collections/collection.md) | `collections.new()`, keyed glyphs + `glyph` |
| [Your first collection](./your-first-collection.md) | Tutorial: aggregate and query |
| [Aggregators](./collections/aggregate.md) | Slot-wise `CollectionAggregator` built-ins |

![Glyph Completions](/docs/media/RibbonCompletions.png)

| Doc | Topic |
| --- | --- |
| [Chain](./completions/chain.md) | `completions.new()`, ingest, storage |
| [Complete](./completions/complete.md) | `complete()` ranked next-word suggestions |
| [Completion options](./completions/options.md) | `order`, `create`, `limit`, `minCount` |
| [Completion results](./completions/results.md) | `GlyphCompletionResult` shape |

![Glyph Spotlight](/docs/media/RibbonSpotlight.png)

| Doc | Topic |
| --- | --- |
| [Your first spotlight](./your-first-spotlight.md) | Tutorial: chunk, rank, query |
| [Document](./spotlight/document.md) | `spotlight.new()`, chunk and fingerprint |
| [Rank](./spotlight/rank.md) | `document.rank()` score all chunks |
| [Query](./spotlight/query.md) | `document.query()` threshold + limit |

### Limits (current version)

| Feature | Status |
| --- | --- |
| In-memory index | Implemented |
| LSH banding index (default) | Implemented |
| Direct (exact) scan via `mode: "direct"` | Implemented |
| Collections (slot-wise glyph aggregate) | Implemented |
| Glyph completions (Markov + rank) | Implemented |
| Spotlight (document chunk rank/query) | Implemented |
| Disk persistence | Not implemented |
| Chain persistence | Not implemented |

### License

Mozilla Public License 2.0 — see [LICENCE](../LICENCE).

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