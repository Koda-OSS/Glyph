import type {
  Glyph,
  GlyphComparisonResult,
  GlyphCreateOptions,
  GlyphGroupInput,
  GlyphSignature,
  GroupResultAggregator,
} from "./core";

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
  aggregate?: GroupResultAggregator;
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
