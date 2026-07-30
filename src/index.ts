/**
 * GlyphTS — MinHash text fingerprints for similarity comparison.
 */

export { create } from "./core/create";
export { compare, GlyphDirectCompare } from "./core/compare";
export {
  createGroup,
  GroupComparison,
  GroupAggregateMax,
} from "./core/group";
export { serialize, deserialize } from "./core/serialize";
export {
  CreateTokens,
  CreateUnigrams,
  CreateVGrams,
  tokenize,
} from "./core/tokenize";
export { TextStrip, TextFilter } from "./core/utils";
export { index } from "./query/index";
export { query } from "./query/query";
export { completions } from "./completions/index";

export type {
  Glyph,
  GlyphGroup,
  GlyphToken,
  GlyphUnigram,
  GlyphVGram,
  GlyphSignature,
  GlyphRecord,
  GlyphCreateOptions,
  GlyphTokenizationOptions,
  GlyphTokenizationResult,
  GlyphComparisonResult,
  GlyphComparisonOptions,
  GlyphGroupComparisonResult,
  GroupAggregate,
  GroupAggregateContext,
  GlyphIndexInstance,
  GlyphQueryOptions,
  GlyphQueryResult,
  GlyphCompletionChainOptions,
  GlyphCompletionOptions,
  GlyphCompletionResult,
  CompletionChainInstance,
} from "./types";
