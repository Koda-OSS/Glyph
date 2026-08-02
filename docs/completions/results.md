![Glyph Completions](/docs/media/RibbonCompletions.png)

# Completion results

> Shape of each suggestion from `Complete()`.

```ts
interface GlyphCompletionResult {
  token: string;
  score: number;
  count: number;
  comparison: GlyphComparisonResult;
  source: {
    key: string;
    glyph: Glyph;
  };
}
```

## Fields

| Field | Type | Meaning |
| --- | --- | --- |
| `token` | `string` | Suggested next word |
| `score` | `number` | Glyph-guided rank (`0`–`1`) |
| `count` | `number` | Markov transition count |
| `comparison` | `GlyphComparisonResult` | Probe vs primary source glyph |
| `source.key` | `string` | Ingest key of the primary source document |
| `source.glyph` | `Glyph` | Primary source document glyph |

## Primary source

When a transition has multiple source glyphs, the **primary source** is the one with the highest similarity to the probe. That source supplies:

- `source.key`
- `source.glyph`
- `comparison`

## `comparison` object

```json
{
  "similarity": 0.38,
  "matches": 49,
  "distance": 79,
  "size": 128
}
```

## Sort order

Results are sorted by:

1. `score` descending
2. `count` descending
3. `token` ascending (stable tiebreak)

## Empty results

`Complete()` returns `[]` when:

- Prefix has fewer than `order - 1` tokens (for `order > 1`)
- No transitions exist for the resolved state key
- All candidates are below `minCount`

## Example

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
  },
  {
    "token": "sun",
    "score": 0.21,
    "count": 1,
    "comparison": {
      "similarity": 0.21,
      "matches": 27,
      "distance": 101,
      "size": 128
    },
    "source": {
      "key": "sun-doc",
      "glyph": "<Uint32Array>"
    }
  }
]
```

## See also

- [Complete](./complete.md)
- [Options](./options.md)
- [Chain](./chain.md)
