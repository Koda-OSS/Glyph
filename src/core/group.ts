import type {
  Glyph,
  GlyphComparisonOptions,
  GlyphGroup,
  GlyphGroupComparisonResult,
  GroupResultAggregator,
} from "../types";
import { Create } from "./create";
import { CompareGlyphs } from "./compare";
import {
  groupEntries,
  normalizeGroup,
  toMatchedKey,
} from "./group-input";

/**
 * Default group result aggregator: take the maximum pairwise similarity.
 */
export const GroupResultAggregatorMax: GroupResultAggregator = ({ scores }) => {
  if (scores.length === 0) {
    return 0;
  }

  return Math.max(...scores);
};

/**
 * Sum pairwise similarities (Spotlight default for group probes).
 */
export const GroupResultAggregatorSum: GroupResultAggregator = ({ scores }) => {
  let total = 0;
  for (const score of scores) {
    total += score;
  }
  return total;
};

/**
 * Build a glyph group from glyphs or raw text strings.
 * Always returns a map (`{ "0": …, "1": … }`).
 */
export function CreateGroup(glyphs: Glyph[] | string[]): GlyphGroup {
  return normalizeGroup(
    glyphs.map((glyph) => {
      if (typeof glyph === "string") {
        return Create(glyph).glyph;
      }

      return glyph;
    }),
  );
}

/**
 * Compare two glyph groups by scoring every pair, then aggregating.
 * Includes matchedLeft/matchedRight for the winning pair when using max aggregate.
 */
export function CompareGroups(
  group1: GlyphGroup,
  group2: GlyphGroup,
  options: GlyphComparisonOptions = {},
): GlyphGroupComparisonResult {
  const left = normalizeGroup(group1);
  const right = normalizeGroup(group2);
  const leftEntries = groupEntries(left);
  const rightEntries = groupEntries(right);

  if (leftEntries.length === 0 || rightEntries.length === 0) {
    throw new Error("Cannot compare empty glyph groups");
  }

  const results: GlyphGroupComparisonResult[] = [];
  const scores: number[] = [];

  for (const leftEntry of leftEntries) {
    for (const rightEntry of rightEntries) {
      const result = CompareGlyphs(leftEntry.glyph, rightEntry.glyph, options);
      const paired: GlyphGroupComparisonResult = {
        ...result,
        matchedLeft: toMatchedKey(leftEntry.key),
        matchedRight: toMatchedKey(rightEntry.key),
      };

      results.push(paired);
      scores.push(result.similarity);
    }
  }

  const aggregate = options.aggregate ?? GroupResultAggregatorMax;
  const similarity = aggregate({
    scores,
    left,
    right,
  });

  const best =
    results.find((result) => result.similarity === similarity) ?? results[0]!;

  return {
    ...best,
    similarity,
  };
}
