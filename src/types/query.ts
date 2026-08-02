import type {
  GlyphComparisonOptions,
  GlyphComparisonResult,
  GroupResultAggregator,
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
