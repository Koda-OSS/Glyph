![Glyph Ribbon](/docs/media/RibbonGlyph.png)

# Your first completion

> Ingest documents. Suggest the next word with glyph-guided ranking.

Glyph Completions builds a Markov chain from your text, then ranks next-word candidates by how close each source document's glyph is to the user's prefix.

## What you will build

1. Create a completion chain.
2. Ingest a few keyed documents.
3. Call `Complete()` on a short prefix.
4. Read `token`, `score`, and `source.key`.

## Create a chain

```ts
import { completions } from "@koda.oss/glyph";

const chain = completions.New({
  order: 3, // trigrams: state = previous 2 tokens
});
```

Default `order` is `3`. Prefixes need at least **two** stripped tokens for a lookup.

## Ingest keyed documents

Each `Ingest` call needs a **key**. That key comes back later as `source.key`.

```ts
chain.Ingest(
  "moon-doc",
  "say goodbye moon farewell night under the stars",
);

chain.Ingest(
  "sun-doc",
  "say goodbye sun hello day in the bright light",
);

chain.Ingest(
  "moon-doc-2",
  "say goodbye moon stars shine across the sky",
);
```

| Step | What happens |
| --- | --- |
| 1 | Fingerprint the full document → glyph `G` |
| 2 | Split into **stripped** unigrams (letters and digits only) |
| 3 | Store each Markov edge with `G` and the ingest key |

> Punctuation does not enter the chain. `"hello,"` and `"hello"` become the same token.

## Complete a prefix

```ts
const results = chain.Complete("say goodbye", {
  limit: 5,
  minCount: 1,
});

for (const hit of results) {
  console.log(hit.token, hit.score, hit.source.key);
}
```

Example output shape:

```json
[
  {
    "token": "moon",
    "score": 0.38,
    "count": 2,
    "comparison": {
      "similarity": 0.38,
      "matches": 49,
      "distance": 79,
      "size": 128
    },
    "source": {
      "key": "moon-doc",
      "glyph": "<Uint32Array>"
    }
  }
]
```

| Field | Meaning |
| --- | --- |
| `token` | Suggested next word |
| `score` | Glyph-guided rank (`0`–`1`) |
| `count` | How often this transition was seen |
| `source.key` | Ingest key of the best-matching source document |
| `source.glyph` | That document's glyph |

When several documents contribute to the same next token, the **primary source** is the one with the highest similarity to the prefix probe.

## How ranking works

```text
Markov  → which next tokens are valid after this state
Glyphs  → which of those tokens are most relevant to the prefix
count   → tiebreak only (and minCount filter)
```

For `"say goodbye"` with `order: 3`:

- State key = `"say goodbye"`
- Candidates might include `"moon"` and `"sun"`
- Probe glyph from the prefix ranks `"moon"` higher if moon-related docs match better

## Try the demo

```bash
npm run demo -- complete "how do groups"
```

The demo ingests every markdown file under `docs/` (file path as key) and prints ranked tokens with source keys.

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Prefix too short (`"say"` with order 3) | Pass at least `order - 1` tokens |
| Expecting punctuation in tokens | Use stripped forms (`goodbye`, not `goodbye,`) |
| Forgetting the ingest key | Always call `Ingest(key, text)` |

## Related

<!-- glyph-related:start -->
- [Completion results](./completions/results.md)
- [Complete a prefix](./completions/complete.md)
- [Completions chain](./completions/chain.md)
- [Collections](./collections/collection.md)
- [Demo CLI](./demo.md)
<!-- glyph-related:end -->

_Related links ranked by [Glyph](https://github.com/Koda-OSS/Glyph)._
