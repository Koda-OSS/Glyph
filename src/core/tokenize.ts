import type {
  GlyphToken,
  GlyphTokenizationOptions,
  GlyphTokenizationResult,
  GlyphUnigram,
  GlyphVGram,
} from "../types";
import { TextFilter, TextStrip } from "./utils";

const DefaultTokenizationOptions = {
  vgramSize: 2,
  normalize: true,
} as const;

/**
 * Split text into word tokens. When normalize is on, each token is filtered.
 */
export function CreateTokens(text: string, normalize = true): GlyphToken[] {
  const raw = text.trim().split(/\s+/).filter((part) => part.length > 0);

  if (!normalize) {
    return raw;
  }

  return raw.map(TextFilter).filter((token) => token.length > 0);
}

/**
 * Build stripped unigrams from text (one per token).
 */
export function CreateUnigrams(text: string, normalize = true): GlyphUnigram[] {
  return unigramsFromTokens(CreateTokens(text, normalize), normalize);
}

/**
 * Build overlapping word vgrams. When normalize is on, each vgram is stripped.
 */
export function CreateVGrams(
  text: string,
  vgramSize: number,
  normalize = true,
): GlyphVGram[] {
  if (vgramSize < 1) {
    throw new Error(`vgramSize must be >= 1, received ${vgramSize}`);
  }

  return vgramsFromTokens(CreateTokens(text, normalize), vgramSize, normalize);
}

/**
 * Tokenize text into filtered tokens, stripped unigrams, and stripped vgrams.
 */
export function Tokenize(
  text: string,
  options: GlyphTokenizationOptions = {},
): GlyphTokenizationResult {
  const vgramSize = options.vgramSize ?? DefaultTokenizationOptions.vgramSize;
  const normalize = options.normalize ?? DefaultTokenizationOptions.normalize;
  const tokens = CreateTokens(text, normalize);

  return {
    tokens,
    unigrams: unigramsFromTokens(tokens, normalize),
    vgrams: vgramsFromTokens(tokens, vgramSize, normalize),
  };
}

export function unigramsFromTokens(
  tokens: GlyphToken[],
  normalize = true,
): GlyphUnigram[] {
  if (!normalize) {
    return [...tokens];
  }

  return tokens.map(TextStrip).filter((unigram) => unigram.length > 0);
}

export function vgramsFromTokens(
  tokens: GlyphToken[],
  vgramSize: number,
  normalize = true,
): GlyphVGram[] {
  if (tokens.length === 0 || tokens.length < vgramSize) {
    return [];
  }

  const vgrams: GlyphVGram[] = [];

  for (let i = 0; i <= tokens.length - vgramSize; i++) {
    vgrams.push(tokens.slice(i, i + vgramSize).join(" "));
  }

  if (!normalize) {
    return vgrams;
  }

  return vgrams.map(TextStrip).filter((vgram) => vgram.length > 0);
}
