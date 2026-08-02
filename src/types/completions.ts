import type {
  Glyph,
  GlyphComparisonResult,
  GlyphCreateOptions,
} from "./core";

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
  complete(
    prefix: string,
    options?: GlyphCompletionOptions,
  ): GlyphCompletionResult[];
  clear(): void;
  size(): number;
}
