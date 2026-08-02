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
  Ingest(key: string, text: string): void;
  Complete(
    prefix: string,
    options?: GlyphCompletionOptions,
  ): GlyphCompletionResult[];
  Clear(): void;
  Size(): number;
}
