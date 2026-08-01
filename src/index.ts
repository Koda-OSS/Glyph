/**
 * GlyphTS — MinHash text fingerprints for similarity comparison.
 */

export { Create } from "./core/create";
export { Compare, CompareGlyphs } from "./core/compare";
export {
  CreateGroup,
  CompareGroups,
  GroupAggregateMax,
} from "./core/group";
export { Serialize, Deserialize } from "./core/serialize";
export {
  CreateTokens,
  CreateUnigrams,
  CreateVGrams,
  Tokenize,
} from "./core/tokenize";
export { TextStrip, TextFilter } from "./core/utils";
export { index } from "./query/index";
export { query } from "./query/query";
export { collections, CollectionQuery } from "./collections/index";
export { completions } from "./completions/index";

export type {
  Glyph,
  GlyphGroup,
  GlyphGroupInput,
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
  GlyphCollectionOptions,
  GlyphCollectionInstance,
  GlyphCompletionChainOptions,
  GlyphCompletionOptions,
  GlyphCompletionResult,
  CompletionChainInstance,
} from "./types";
