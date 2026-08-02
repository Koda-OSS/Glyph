import type {
  GlyphComparisonOptions,
  GlyphComparisonResult,
  GlyphGroupInput,
  GlyphSignature,
  GroupResultAggregator,
  Glyph,
} from "./core";

export interface GlyphQueryOptions {
  limit?: number;
  threshold?: number;
  normalize?: boolean;
  aggregate?: GroupResultAggregator;
  compare?: GlyphComparisonOptions;
}

export interface GlyphQueryResult {
  key: string;
  similarity: number;
  comparison: GlyphComparisonResult;
  matched?: string | number;
}

export interface GlyphQueryInstance {
  Search(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
    options?: GlyphQueryOptions,
  ): GlyphQueryResult[];
}
