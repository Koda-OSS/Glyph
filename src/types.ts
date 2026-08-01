// Core types
export type GlyphToken = string;
export type GlyphUnigram = string;
export type GlyphVGram = string;
export type Glyph = Uint32Array & {
  readonly __glyph: true;
};
export type GlyphGroup = Record<string, Glyph>;
export type GlyphGroupInput = GlyphGroup | Glyph[];

// Creation related types
export interface GlyphSignature {
  version: number; // version of create.ts used
  glyph: Glyph; // the glyph itself
}

export interface GlyphRecord extends GlyphSignature {
  createdAt: number; // ms since epoch
}

export interface GlyphCreateOptions {
  size?: number;
  vgramSize?: number;
  normalize?: boolean;
}

// Tokenization related types
export interface GlyphTokenizationOptions {
  vgramSize?: number;
  normalize?: boolean;
}

export interface GlyphTokenizationResult {
  tokens: GlyphToken[];
  unigrams: GlyphUnigram[];
  vgrams: GlyphVGram[];
}

// Comparison related types
export interface GlyphComparisonResult {
  similarity: number; // percentage (0.0 to 1.0) of similarity between the two glyphs
  distance: number; // number of different signatures between the two glyphs
  matches: number; // number of matching signatures between the two glyphs
  size: number; // size of the glyph in signatures
  matchedLeft?: string | number;
  matchedRight?: string | number;
}

export interface GlyphComparisonOptions {
  aggregate?: GroupAggregate;
}

// Group related types
export type GroupAggregateContext = {
  scores: number[];
  left: GlyphGroup;
  right: GlyphGroup;
};

export type GroupAggregate = (context: GroupAggregateContext) => number;

export type GlyphGroupComparisonResult = GlyphComparisonResult;

// Glyph Index types (Core)
export type GlyphIndexMode = "bands" | "direct";

export interface GlyphIndexOptions {
  mode?: GlyphIndexMode;
  bands?: number;
  rows?: number;
  glyphSize?: number;
}

export interface GlyphIndexInstance {
  readonly mode: GlyphIndexMode;
  get(key: string): Glyph | GlyphGroup | undefined;
  set(key: string, glyphs?: Glyph | GlyphGroupInput): void;
  add(key: string, glyphs: Glyph | GlyphGroupInput): void;
  remove(key: string): void;
  has(key: string): boolean;
  clear(): void;
  size(): number;
  keys(): IterableIterator<string>;
  values(): IterableIterator<Glyph | GlyphGroup>;
  entries(): IterableIterator<[string, Glyph | GlyphGroup]>;
  candidateKeys(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
  ): IterableIterator<string>;
}

// Glyph Query types
export interface GlyphQueryOptions {
  limit?: number;
  threshold?: number;
  normalize?: boolean;
  aggregate?: GroupAggregate;
  compare?: GlyphComparisonOptions;
}

export interface GlyphQueryResult {
  key: string;
  similarity: number;
  comparison: GlyphComparisonResult;
  matched?: string | number;
}

// Glyph Collections types
export interface GlyphCollectionOptions {
  create?: GlyphCreateOptions;
}

export interface GlyphCollectionInstance {
  Add(key: string, example: string | Glyph): void;
  AddGroup(group: GlyphGroupInput): void;
  Remove(key: string): void;
  Clear(): void;
  Examples(): GlyphGroup;
  Has(key: string): boolean;
  Count(): number;
  Query(
    index: GlyphIndexInstance,
    options?: GlyphQueryOptions,
  ): GlyphQueryResult[];
}

// Glyph Completions types
export interface GlyphCompletionChainOptions {
  order?: number;
  create?: GlyphCreateOptions;
}

export interface GlyphCompletionOptions {
  limit?: number;
  minCount?: number;
}

export interface GlyphCompletionResult {
  token: string;
  score: number;
  count: number;
  comparison: GlyphComparisonResult;
  source: {
    key: string;
    glyph: Glyph;
  };
}

export interface CompletionChainInstance {
  ingest(key: string, text: string): void;
  complete(prefix: string, options?: GlyphCompletionOptions): GlyphCompletionResult[];
  clear(): void;
  size(): number;
}

// Glyph Spotlight types
export type GlyphSpotlightChunk = string;

export type GlyphSpotlightChunker = (text: string) => GlyphSpotlightChunk[];

export type GlyphSpotlightCompiledChunk = {
  text: string;
  glyph: Glyph;
  length: number;
};

export interface GlyphSpotlightOptions {
  normalize?: boolean;
  create?: GlyphCreateOptions;
  /** Applies only when the probe is a group. Default: sum (not max/average). */
  aggregate?: GroupAggregate;
  chunker?: GlyphSpotlightChunker;
  /** When true, rank/query return string[] ordered by score descending. */
  textOutput?: boolean;
}

export interface GlyphSpotlightQueryOptions extends GlyphSpotlightOptions {
  limit?: number;
  threshold?: number;
}

export interface GlyphSpotlightRankOptions extends GlyphSpotlightOptions {}

export interface GlyphSpotlightResult extends GlyphSpotlightCompiledChunk {
  score: number;
  comparison: GlyphComparisonResult;
  matched?: string | number;
}

export interface GlyphSpotlightDocumentInstance {
  rank(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
    options?: GlyphSpotlightRankOptions & { textOutput?: false },
  ): GlyphSpotlightResult[];
  rank(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
    options: GlyphSpotlightRankOptions & { textOutput: true },
  ): string[];

  query(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
    options?: GlyphSpotlightQueryOptions & { textOutput?: false },
  ): GlyphSpotlightResult[];
  query(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
    options: GlyphSpotlightQueryOptions & { textOutput: true },
  ): string[];

  chunks(): readonly GlyphSpotlightCompiledChunk[];
  size(): number;
}