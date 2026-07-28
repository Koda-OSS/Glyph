import type {
  Glyph,
  GlyphComparisonOptions,
  GlyphGroup,
  GlyphGroupComparisonResult,
  GroupAggregate,
} from "../types";
import { create } from "./create";
import { GlyphDirectCompare } from "./compare";
import { resolveGlyphsToArray } from "./utils";

/**
 * Default group aggregate: take the maximum pairwise similarity.
 */
export const GroupAggregateMax: GroupAggregate = ({ scores }) => {
  if (scores.length === 0) {
    return 0;
  }

  return Math.max(...scores);
};

/**
 * Build a glyph group from glyphs or raw text strings.
 */
export function createGroup(glyphs: Glyph[] | string[]): GlyphGroup {
  return glyphs.map((glyph) => {
    if (typeof glyph === "string") {
      return create(glyph).glyph;
    }

    return glyph;
  });
}

/**
 * Compare two glyph groups by scoring every pair, then aggregating.
 * Includes matchedLeft/matchedRight for the winning pair when using max aggregate.
 */
export function GroupComparison(
  group1: GlyphGroup,
  group2: GlyphGroup,
  options: GlyphComparisonOptions = {},
): GlyphGroupComparisonResult {
  const left = resolveGlyphsToArray(group1);
  const right = resolveGlyphsToArray(group2);
  const leftKeys = memberKeys(group1);
  const rightKeys = memberKeys(group2);

  if (left.length === 0 || right.length === 0) {
    throw new Error("Cannot compare empty glyph groups");
  }

  const results: GlyphGroupComparisonResult[] = [];
  const scores: number[] = [];

  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) {
      const result = GlyphDirectCompare(left[i]!, right[j]!, options);
      const paired: GlyphGroupComparisonResult = { ...result };
      const leftKey = leftKeys[i];
      const rightKey = rightKeys[j];
      if (leftKey !== undefined) {
        paired.matchedLeft = leftKey;
      }
      if (rightKey !== undefined) {
        paired.matchedRight = rightKey;
      }
      results.push(paired);
      scores.push(result.similarity);
    }
  }

  const aggregate = options.aggregate ?? GroupAggregateMax;
  const similarity = aggregate({
    scores,
    left: group1,
    right: group2,
  });

  const best =
    results.find((result) => result.similarity === similarity) ?? results[0]!;

  return {
    ...best,
    similarity,
  };
}

function memberKeys(group: GlyphGroup): Array<string | number> {
  if (Array.isArray(group)) {
    return group.map((_, index) => index);
  }

  return Object.keys(group);
}
