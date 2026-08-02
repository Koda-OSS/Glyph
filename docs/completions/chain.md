![Glyph Completions](/docs/media/RibbonCompletions.png)

# Completions chain

> Build a Markov chain with document glyphs attached to each transition.

`completions.New()` creates an in-memory **completion chain**. Ingest text to learn transitions. Call `Complete()` to rank next-word candidates by glyph similarity.

## Create a chain

```ts
import { completions } from "glyph-ts";

const chain = completions.New({
  order: 3,
  create: { size: 128, normalize: true },
});
```

| Option | Default | Meaning |
| --- | --- | --- |
| `order` | `3` | Markov order (state = previous `order - 1` tokens) |
| `create` | `{}` | Options forwarded to `Create()` on ingest and complete |

## Ingest documents

```ts
chain.Ingest("moon-doc", "goodbye moon farewell night");
chain.Ingest("sun-doc", "goodbye sun hello day");
```

`Ingest(key, text)` requires a **key**. That key is stored on every transition and returned as `source.key` on completion results.

Per ingest:

1. Fingerprint the full document → glyph `G`
2. Tokenize with **stripped unigrams** (`CreateUnigrams` / `TextStrip`) — letters and digits only
3. For each Markov transition, store `G` and `key` on that edge

> Chain tokens are **stripped**, not just filtered. Punctuation and symbols do not enter the Markov state.

### Storage model

```text
Map<stateKey, Map<nextToken, { count, sources[] }>>
```

| Field | Meaning |
| --- | --- |
| `stateKey` | Previous `order - 1` tokens joined by space (`""` when `order: 1`) |
| `count` | How many times this transition was seen |
| `sources` | `{ key, glyph, weight }` per ingested document |

Duplicate `Ingest` calls with the **same key** merge weights on matching transitions.

## Chain methods

| Method | Behavior |
| --- | --- |
| `Ingest(key, text)` | Add transitions from a keyed document |
| `Complete(prefix, options?)` | Rank next-token candidates |
| `Clear()` | Remove all states |
| `Size()` | Number of distinct state keys |

## See also

- [Complete](./complete.md)
- [Options](./options.md)
- [Results](./results.md)
