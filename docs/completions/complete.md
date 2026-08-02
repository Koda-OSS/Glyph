![Glyph Completions](/docs/media/RibbonCompletions.png)

# Complete a prefix

> Rank next-word candidates with `Complete()`.

```ts
const results = chain.Complete("goodbye", {
  limit: 5,
  minCount: 1,
});
```

## Flow

```text
1. probe = Create(prefix).glyph
2. tokens = CreateUnigrams(prefix)   // TextStrip — letters/digits only
3. if tokens.length < order - 1 → return []
4. stateKey = last (order - 1) tokens joined
5. candidates = transitions from stateKey
6. score each candidate by weighted glyph similarity to probe
7. sort by score desc → count desc → token asc
8. apply minCount, then limit
```

## Scoring

Markov structure defines **which** tokens are valid. Glyph similarity defines **rank**.

```text
glyphScore = sum(weight_i * CompareGlyphs(probe, source_i).similarity) / sum(weight_i)
```

| Rank factor | Role |
| --- | --- |
| `score` | Primary sort (glyph-guided) |
| `count` | Tiebreak when scores are equal |
| `token` | Lexical tiebreak for stability |

> Occurrence count does not drive primary rank. It only filters candidates (`minCount`) and breaks ties.

## Completions vs query

| Use | API |
| --- | --- |
| Find similar **documents** | [Query](../query/query.md) |
| Suggest the **next word** in a prefix | Completions |

## See also

- [Chain](./chain.md)
- [Options](./options.md)
- [Results](./results.md)
