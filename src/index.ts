/**
 * GlyphTS — MinHash text fingerprints for similarity comparison.
 */

export { Create } from "./core/create";
export { Compare, CompareGlyphs } from "./core/compare";
export {
  CreateGroup,
  CompareGroups,
  GroupAggregateMax,
  GroupAggregateSum,
} from "./core/group";
export { Serialize, Deserialize } from "./core/serialize";
export {
  CreateTokens,
  CreateUnigrams,
  CreateVGrams,
  Tokenize,
} from "./core/tokenize";
export { TextStrip, TextFilter } from "./core/utils";
export { index } from "./core/index";
export { query } from "./query/query";
export { collections, CollectionQuery } from "./collections/index";
export { completions } from "./completions/index";
export { spotlight } from "./spotlight/index";

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
  GlyphIndexMode,
  GlyphIndexOptions,
  GlyphIndexInstance,
  GlyphQueryOptions,
  GlyphQueryResult,
  GlyphCollectionOptions,
  GlyphCollectionInstance,
  GlyphCompletionChainOptions,
  GlyphCompletionOptions,
  GlyphCompletionResult,
  CompletionChainInstance,
  GlyphSpotlightChunk,
  GlyphSpotlightChunker,
  GlyphSpotlightCompiledChunk,
  GlyphSpotlightOptions,
  GlyphSpotlightQueryOptions,
  GlyphSpotlightRankOptions,
  GlyphSpotlightResult,
  GlyphSpotlightDocumentInstance,
} from "./types";
