/**
 * Glyph — MinHash text fingerprints for similarity comparison.
 */

export { Create } from "./core/create";
export { Compare, CompareGlyphs } from "./core/compare";
export {
  CreateGroup,
  CompareGroups,
  GroupResultAggregatorMax,
  GroupResultAggregatorSum,
} from "./core/group";
export { Serialize, Deserialize } from "./core/serialize";
export {
  CreateTokens,
  CreateUnigrams,
  CreateVGrams,
  Tokenize,
} from "./core/tokenize";
export { TextStrip, TextFilter } from "./core/text";
export {
  EmptyGroupError,
  GlyphSizeMismatchError,
  InvalidSerializedGlyphError,
} from "./errors";
export { index } from "./index/index";
export { query } from "./query/index";
export {
  collections,
  CollectionAggregatorMin,
  CollectionAggregatorMax,
  CollectionAggregatorMean,
  CollectionAggregatorMid,
  CollectionAggregatorSum,
  CollectionAggregatorSoftmax,
} from "./collections/index";
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
  GroupResultAggregator,
  GroupResultAggregatorContext,
  GlyphIndexMode,
  GlyphIndexOptions,
  GlyphIndexInstance,
  GlyphQueryOptions,
  GlyphQueryResult,
  GlyphQueryInstance,
  CollectionAggregator,
  CollectionAggregatorContext,
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
