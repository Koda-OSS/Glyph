![Glyph Ribbon](/docs/media/RibbonGlyph.png)

# API surface

> Every public export from `glyph-ts`, grouped by layer.

Deep docs live under [Core](./core/glyph.md), [Query](./query/index.md), [Collections](./collections/collection.md), and [Completions](./completions/chain.md).

## Core

### Functions

| Export | Signature | Doc |
| --- | --- | --- |
| `Create` | `(text, options?) => GlyphRecord` | [Create](./core/create.md) |
| `Compare` | `(a, b, options?) => GlyphComparisonResult` | [Compare](./core/compare.md) |
| `CompareGlyphs` | `(a, b, options?) => GlyphComparisonResult` | [Compare](./core/compare.md) |
| `CreateGroup` | `(glyphs: Glyph[] \| string[]) => GlyphGroup` | [Groups](./core/groups.md) |
| `CompareGroups` | `(group1, group2, options?) => GlyphComparisonResult` | [Groups](./core/groups.md) |
| `GroupAggregateMax` | `GroupAggregate` | [Groups](./core/groups.md) |
| `Serialize` | `(Glyph \| GlyphSignature \| GlyphRecord) => string` | [Serialize](./core/serialize.md) |
| `Deserialize` | `(string) => Glyph` | [Serialize](./core/serialize.md) |
| `CreateTokens` | `(text, normalize?) => GlyphToken[]` | [Tokenize](./core/tokenize.md) |
| `CreateUnigrams` | `(text, normalize?) => GlyphUnigram[]` | [Tokenize](./core/tokenize.md) |
| `CreateVGrams` | `(text, vgramSize, normalize?) => GlyphVGram[]` | [Tokenize](./core/tokenize.md) |
| `Tokenize` | `(text, options?) => GlyphTokenizationResult` | [Tokenize](./core/tokenize.md) |
| `TextFilter` | `(text) => string` | [Text normalization](./core/text-normalization.md) |
| `TextStrip` | `(text) => string` | [Text normalization](./core/text-normalization.md) |

### Core types

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
  size?: number;        // default 128
  vgramSize?: number;   // default 4
  normalize?: boolean;  // default true
}

interface GlyphTokenizationOptions {
  vgramSize?: number;   // default 2 in Tokenize()
  normalize?: boolean;  // default true
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
```

See [Glyph](./core/glyph.md) for type notes.

## Query

### Functions

| Export | Signature | Doc |
| --- | --- | --- |
| `index.new` | `() => GlyphIndexInstance` | [Index](./query/index.md) |
| `query` | `(queryGlyph, index, options?) => GlyphQueryResult[]` | [Query](./query/query.md) |

### Query types

```ts
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
  threshold?: number;      // default 0
  normalize?: boolean;     // default false
  aggregate?: GroupAggregate;
  compare?: GlyphComparisonOptions;
}

interface GlyphQueryResult {
  key: string;
  similarity: number;
  comparison: GlyphComparisonResult;
}
```

Result fields: [Query results](./query/results.md).

## Collections

### Functions

| Export | Signature | Doc |
| --- | --- | --- |
| `collections.new` | `(options?) => GlyphCollectionInstance` | [Collections](./collections/collection.md) |
| `CollectionQuery` | `(collection, index, options?) => GlyphQueryResult[]` | [Collection query](./collections/query.md) |

### Collections types

```ts
interface GlyphCollectionOptions {
  create?: GlyphCreateOptions;
}

interface GlyphCollectionInstance {
  Add(key: string, example: string | Glyph): void;
  AddGroup(group: Record<string, Glyph>): void;
  Remove(key: string): void;
  Clear(): void;
  Examples(): Record<string, Glyph>;
  Has(key: string): boolean;
  Count(): number;
  Query(index: GlyphIndexInstance, options?: GlyphQueryOptions): GlyphQueryResult[];
}
```

## Completions

### Functions

| Export | Signature | Doc |
| --- | --- | --- |
| `completions.new` | `(options?) => CompletionChainInstance` | [Chain](./completions/chain.md) |

### Completions types

```ts
interface GlyphCompletionChainOptions {
  order?: number;               // default 3
  create?: GlyphCreateOptions;
}

interface GlyphCompletionOptions {
  limit?: number;    // default 5
  minCount?: number; // default 1
}

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

interface CompletionChainInstance {
  ingest(key: string, text: string): void;
  complete(prefix: string, options?: GlyphCompletionOptions): GlyphCompletionResult[];
  clear(): void;
  size(): number;
}
```

Result fields: [Completion results](./completions/results.md).
