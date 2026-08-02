![Glyph Ribbon](/docs/media/RibbonGlyph.png)

# API surface

> Every public export from `glyph-ts`, grouped by layer.

Deep docs live under [Core](./core/glyph.md), [Index](./core/index.md), [Query](./query/query.md), [Collections](./collections/collection.md), [Completions](./completions/chain.md), and [Spotlight](./spotlight/document.md).

## Core

### Functions

| Export | Signature | Doc |
| --- | --- | --- |
| `Create` | `(text, options?) => GlyphRecord` | [Create](./core/create.md) |
| `Compare` | `(a, b, options?) => GlyphComparisonResult` | [Compare](./core/compare.md) |
| `CompareGlyphs` | `(a, b, options?) => GlyphComparisonResult` | [Compare](./core/compare.md) |
| `CreateGroup` | `(glyphs: Glyph[] \| string[]) => GlyphGroup` | [Groups](./core/groups.md) |
| `CompareGroups` | `(group1, group2, options?) => GlyphComparisonResult` | [Groups](./core/groups.md) |
| `GroupResultAggregatorMax` | `GroupResultAggregator` | [Groups](./core/groups.md) |
| `GroupResultAggregatorSum` | `GroupResultAggregator` | [Groups](./core/groups.md) |
| `Serialize` | `(Glyph \| GlyphSignature \| GlyphRecord) => string` | [Serialize](./core/serialize.md) |
| `Deserialize` | `(string) => Glyph` | [Serialize](./core/serialize.md) |
| `CreateTokens` | `(text, normalize?) => GlyphToken[]` | [Tokenize](./core/tokenize.md) |
| `CreateUnigrams` | `(text, normalize?) => GlyphUnigram[]` | [Tokenize](./core/tokenize.md) |
| `CreateVGrams` | `(text, vgramSize, normalize?) => GlyphVGram[]` | [Tokenize](./core/tokenize.md) |
| `Tokenize` | `(text, options?) => GlyphTokenizationResult` | [Tokenize](./core/tokenize.md) |
| `TextFilter` | `(text) => string` | [Text normalization](./core/text-normalization.md) |
| `TextStrip` | `(text) => string` | [Text normalization](./core/text-normalization.md) |
| `index.New` | `(options?) => GlyphIndexInstance` | [Index](./core/index.md) |

### Core types

```ts
type Glyph = Uint32Array & { readonly __glyph: true };
type GlyphGroup = Record<string, Glyph>;
type GlyphGroupInput = GlyphGroup | Glyph[];
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
  matchedLeft?: string | number;
  matchedRight?: string | number;
}


interface GlyphComparisonOptions {
  aggregate?: GroupResultAggregator;
}

type GroupResultAggregatorContext = {
  scores: number[];
  left: GlyphGroup;
  right: GlyphGroup;
};

type GroupResultAggregator = (context: GroupResultAggregatorContext) => number;

type GlyphIndexMode = "bands" | "direct";

interface GlyphIndexOptions {
  mode?: GlyphIndexMode;   // default "bands"
  bands?: number;          // default 64 when size is 128
  rows?: number;           // default 2 when size is 128
  glyphSize?: number;
}

interface GlyphIndexInstance {
  readonly mode: GlyphIndexMode;
  Get(key: string): Glyph | GlyphGroup | undefined;
  Set(key: string, glyphs?: Glyph | GlyphGroupInput): void;
  Add(key: string, glyphs: Glyph | GlyphGroupInput): void;
  Remove(key: string): void;
  Has(key: string): boolean;
  Clear(): void;
  Size(): number;
  Keys(): IterableIterator<string>;
  Values(): IterableIterator<Glyph | GlyphGroup>;
  Entries(): IterableIterator<[string, Glyph | GlyphGroup]>;
  CandidateKeys(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
  ): IterableIterator<string>;
}
```

See [Glyph](./core/glyph.md) and [Index](./core/index.md) for type notes.

## Query

### Functions

| Export | Signature | Doc |
| --- | --- | --- |
| `query.New` | `(index) => GlyphQueryInstance` | [Query](./query/query.md) |

### Query types

```ts
interface GlyphQueryInstance {
  Search(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
    options?: GlyphQueryOptions,
  ): GlyphQueryResult[];
}

interface GlyphQueryOptions {
  limit?: number;
  threshold?: number;      // default 0
  normalize?: boolean;     // default false
  aggregate?: GroupResultAggregator;
  compare?: GlyphComparisonOptions;
}

interface GlyphQueryResult {
  key: string;
  similarity: number;
  comparison: GlyphComparisonResult;
  matched?: string | number;
}
```

Result fields: [Query results](./query/results.md).

## Collections

### Functions

| Export | Signature | Doc |
| --- | --- | --- |
| `collections.New` | `(options?) => GlyphCollectionInstance` | [Collections](./collections/collection.md) |
| `CollectionAggregatorMin` | `CollectionAggregator` | [Aggregators](./collections/aggregate.md) |
| `CollectionAggregatorMax` | `CollectionAggregator` | [Aggregators](./collections/aggregate.md) |
| `CollectionAggregatorMean` | `CollectionAggregator` | [Aggregators](./collections/aggregate.md) |
| `CollectionAggregatorMid` | `CollectionAggregator` | [Aggregators](./collections/aggregate.md) |
| `CollectionAggregatorSum` | `CollectionAggregator` | [Aggregators](./collections/aggregate.md) |
| `CollectionAggregatorSoftmax` | `CollectionAggregator` | [Aggregators](./collections/aggregate.md) |

### Collections types

```ts
type CollectionAggregatorContext = {
  collection: GlyphGroup;
  index: number;
};

type CollectionAggregator = (
  values: number[],
  context?: CollectionAggregatorContext,
) => number;

interface GlyphCollectionOptions {
  create?: GlyphCreateOptions;
  aggregator?: CollectionAggregator; // default CollectionAggregatorSoftmax
}

interface GlyphCollectionInstance {
  readonly glyph: Glyph;
  Add(key: string, example: string | Glyph): void;
  AddGroup(group: GlyphGroupInput): void;
  Remove(key: string): void;
  Clear(): void;
  Collection(): GlyphGroup;
  Has(key: string): boolean;
  Count(): number;
}
```

See [Collections](./collections/collection.md) and [Aggregators](./collections/aggregate.md).

## Completions

### Functions

| Export | Signature | Doc |
| --- | --- | --- |
| `completions.New` | `(options?) => CompletionChainInstance` | [Chain](./completions/chain.md) |

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
  Ingest(key: string, text: string): void;
  Complete(prefix: string, options?: GlyphCompletionOptions): GlyphCompletionResult[];
  Clear(): void;
  Size(): number;
}
```

Result fields: [Completion results](./completions/results.md).

![Glyph Spotlight](/docs/media/RibbonSpotlight.png)

## Spotlight

### Functions

| Export | Signature | Doc |
| --- | --- | --- |
| `spotlight.New` | `(content, options?) => GlyphSpotlightDocumentInstance` | [Document](./spotlight/document.md) |

### Spotlight types

```ts
type GlyphSpotlightChunk = string;
type GlyphSpotlightChunker = (text: string) => GlyphSpotlightChunk[];

type GlyphSpotlightCompiledChunk = {
  text: string;
  glyph: Glyph;
  length: number;
};

interface GlyphSpotlightOptions {
  normalize?: boolean;
  create?: GlyphCreateOptions;
  aggregate?: GroupResultAggregator;  // default GroupResultAggregatorSum for group probes
  chunker?: GlyphSpotlightChunker;
  textOutput?: boolean;        // default false
}

interface GlyphSpotlightQueryOptions extends GlyphSpotlightOptions {
  limit?: number;
  threshold?: number;          // default 0
}

interface GlyphSpotlightRankOptions extends GlyphSpotlightOptions {}

interface GlyphSpotlightResult extends GlyphSpotlightCompiledChunk {
  score: number;
  comparison: GlyphComparisonResult;
  matched?: string | number;
}

interface GlyphSpotlightDocumentInstance {
  Rank(probe, options?): GlyphSpotlightResult[] | string[];
  Query(probe, options?): GlyphSpotlightResult[] | string[];
  Chunks(): readonly GlyphSpotlightCompiledChunk[];
  Size(): number;
}
```

See [Document](./spotlight/document.md), [Rank](./spotlight/rank.md), [Query](./spotlight/query.md).

## Errors

Named error classes exported from `glyph-ts`:

| Export | When thrown |
| --- | --- |
| `GlyphSizeMismatchError` | Compare or collection operations receive glyphs of different lengths |
| `EmptyGroupError` | Group compare runs on an empty group (default message: `"Cannot compare empty glyph groups"`) |
| `InvalidSerializedGlyphError` | `Deserialize()` receives malformed or unsupported serialized glyph data |
