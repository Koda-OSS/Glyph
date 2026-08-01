import type {
  Glyph,
  GlyphGroupInput,
  GlyphSignature,
  GlyphSpotlightCompiledChunk,
  GlyphSpotlightOptions,
  GlyphSpotlightResult,
} from "../types";
import { Compare, CompareGlyphs } from "../core/compare";
import { GroupResultAggregatorSum } from "../core/group";
import { isGlyphGroup } from "../core/utils";

/**
 * Score every compiled chunk against a probe; sort by score descending.
 */
export function scoreChunks(
  probe: Glyph | GlyphSignature | GlyphGroupInput,
  compiled: readonly GlyphSpotlightCompiledChunk[],
  options: GlyphSpotlightOptions = {},
): GlyphSpotlightResult[] {
  const aggregate = options.aggregate ?? GroupResultAggregatorSum;
  const groupProbe = isGlyphGroup(probe);

  const results: GlyphSpotlightResult[] = compiled.map((chunk) => {
    const comparison = groupProbe
      ? Compare(probe, chunk.glyph, { aggregate })
      : CompareGlyphs(probe as Glyph | GlyphSignature, chunk.glyph);

    const result: GlyphSpotlightResult = {
      text: chunk.text,
      glyph: chunk.glyph,
      length: chunk.length,
      score: comparison.similarity,
      comparison,
    };

    if (groupProbe && comparison.matchedLeft !== undefined) {
      result.matched = comparison.matchedLeft;
    }

    return result;
  });

  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Optionally project results to text-only strings.
 */
export function formatOutput(
  results: GlyphSpotlightResult[],
  textOutput?: boolean,
): GlyphSpotlightResult[] | string[] {
  if (textOutput) {
    return results.map((result) => result.text);
  }
  return results;
}
