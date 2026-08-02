import type {
  Glyph,
  GlyphGroupInput,
  GlyphIndexInstance,
  GlyphQueryInstance,
  GlyphQueryOptions,
  GlyphQueryResult,
  GlyphSignature,
} from "../types";
import { Compare } from "../core/compare";
import { GroupResultAggregatorMax } from "../core/group";
import { isGlyphGroup } from "../core/group-input";

/**
 * Search a Glyph Query index and return ranked matches.
 */
function search(
  glyphIndex: GlyphIndexInstance,
  queryGlyph: Glyph | GlyphSignature | GlyphGroupInput,
  options: GlyphQueryOptions = {},
): GlyphQueryResult[] {
  const threshold = options.threshold ?? 0;
  const aggregate =
    options.aggregate ?? options.compare?.aggregate ?? GroupResultAggregatorMax;
  const compareOptions = {
    ...options.compare,
    aggregate,
  };

  const results: GlyphQueryResult[] = [];

  for (const key of glyphIndex.CandidateKeys(queryGlyph)) {
    const value = glyphIndex.Get(key);
    if (value === undefined) {
      continue;
    }

    const comparison = Compare(queryGlyph, value, compareOptions);

    if (comparison.similarity < threshold) {
      continue;
    }

    const result: GlyphQueryResult = {
      key,
      similarity: comparison.similarity,
      comparison,
    };

    if (isGlyphGroup(value) && comparison.matchedRight !== undefined) {
      result.matched = comparison.matchedRight;
    }

    results.push(result);
  }

  results.sort((a, b) => b.similarity - a.similarity);

  const limited =
    options.limit === undefined ? results : results.slice(0, options.limit);

  if (!options.normalize || limited.length === 0) {
    return limited;
  }

  const top = limited[0]!.similarity;
  if (top === 0) {
    return limited;
  }

  return limited.map((result) => ({
    ...result,
    similarity: result.similarity / top,
    comparison: {
      ...result.comparison,
      similarity: result.comparison.similarity / top,
    },
  }));
}

/**
 * Create a query wrapper bound to an index.
 */
export function createQuery(glyphIndex: GlyphIndexInstance): GlyphQueryInstance {
  return {
    Search(probe, options) {
      return search(glyphIndex, probe, options);
    },
  };
}

/**
 * Glyph Query namespace — wraps an index for ranked search.
 */
export const query = {
  New: createQuery,
};
