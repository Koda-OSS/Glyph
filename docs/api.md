# API reference

Public exports from `glyph-ts`.

## Functions

### Creation

| Export | Signature | Notes |
| --- | --- | --- |
| `create` | `(text, options?) => GlyphRecord` | Main fingerprint builder |
| `createGroup` | `(glyphs: Glyph[] \| string[]) => GlyphGroup` | Build a group |

### Comparison

| Export | Signature | Notes |
| --- | --- | --- |
| `compare` | `(a, b, options?) => GlyphComparisonResult` | Auto direct vs group |
| `GlyphDirectCompare` | `(a, b, options?) => GlyphComparisonResult` | Single-pair only |
| `GroupComparison` | `(group1, group2, options?) => GlyphComparisonResult` | Explicit group compare |
| `GroupAggregateMax` | `GroupAggregate` | Default max-of-scores aggregator |

### Glyph Query

| Export | Signature | Notes |
| --- | --- | --- |
| `index.new` | `() => GlyphIndexInstance` | Create an in-memory index |
| `query` | `(queryGlyph, index, options?) => GlyphQueryResult[]` | Ranked search |

### Serialize

| Export | Signature | Notes |
| --- | --- | --- |
| `serialize` | `(Glyph \| GlyphSignature \| GlyphRecord) => string` | Portable encoding |
| `deserialize` | `(string) => Glyph` | Always returns a glyph |

### Tokenization

| Export | Signature | Notes |
| --- | --- | --- |
| `CreateTokens` | `(text, normalize?) => GlyphToken[]` | Filtered words |
| `CreateUnigrams` | `(text, normalize?) => GlyphUnigram[]` | Stripped unigrams |
| `CreateVGrams` | `(text, vgramSize, normalize?) => GlyphVGram[]` | Stripped n-grams |
| `tokenize` | `(text, options?) => GlyphTokenizationResult` | All three together |
| `TextFilter` | `(text) => string` | Token normalization |
| `TextStrip` | `(text) => string` | Unigram/vgram normalization |

## Types

```ts
type Glyph = Uint32Array & { readonly __glyph: true };
type GlyphGroup = Glyph[] | Record<string, Glyph>;
type GlyphToken = string;
type GlyphUnigram = string;
type GlyphVGram = string;

interface GlyphSignature {
  version: number;
  glyph: Glyph;
}

interface GlyphRecord extends GlyphSignature {
  createdAt: number;
}

interface GlyphCreateOptions {
  size?: number;
  vgramSize?: number;
  normalize?: boolean;
}

interface GlyphTokenizationOptions {
  vgramSize?: number;
  normalize?: boolean;
}

interface GlyphTokenizationResult {
  tokens: GlyphToken[];
  unigrams: GlyphUnigram[];
  vgrams: GlyphVGram[];
}

interface GlyphComparisonResult {
  similarity: number;
  distance: number;
  matches: number;
  size: number;
  matchedLeft?: string | number;
  matchedRight?: string | number;
}

interface GlyphComparisonOptions {
  aggregate?: GroupAggregate;
}

type GroupAggregateContext = {
  scores: number[];
  left: GlyphGroup;
  right: GlyphGroup;
};

type GroupAggregate = (context: GroupAggregateContext) => number;

interface GlyphIndexInstance {
  get(key: string): Glyph | GlyphGroup | undefined;
  set(key: string, glyphs?: Glyph | GlyphGroup): void;
  add(key: string, glyphs: Glyph | GlyphGroup): void;
  remove(key: string): void;
  has(key: string): boolean;
  clear(): void;
  size(): number;
  keys(): IterableIterator<string>;
  values(): IterableIterator<Glyph | GlyphGroup>;
  entries(): IterableIterator<[string, Glyph | GlyphGroup]>;
}

interface GlyphQueryOptions {
  limit?: number;
  threshold?: number;
  normalize?: boolean;
  aggregate?: GroupAggregate;
  compare?: GlyphComparisonOptions;
}

interface GlyphQueryResult {
  key: string;
  similarity: number;
  comparison: GlyphComparisonResult;
  matched?: string | number;
}
```

## Guides

- [Getting started](./getting-started.md)
- [Creating glyphs](./create.md)
- [Comparing](./compare.md)
- [Groups](./groups.md)
- [Glyph Query](./query.md)
- [Serialize](./serialize.md)
- [Tokenization](./tokenize.md)
- [Demo CLI](./demo.md)
