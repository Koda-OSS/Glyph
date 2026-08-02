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
  aggregate?: GroupResultAggregator;
}

// Group related types
export type GroupResultAggregatorContext = {
  scores: number[];
  left: GlyphGroup;
  right: GlyphGroup;
};

export type GroupResultAggregator = (
  context: GroupResultAggregatorContext,
) => number;

export type GlyphGroupComparisonResult = GlyphComparisonResult;
