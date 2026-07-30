import type {
  Glyph,
  GlyphComparisonOptions,
  GlyphComparisonResult,
  GlyphGroup,
  GlyphSignature,
} from "../types";
import { CompareGroups } from "./group";
import {
  IsGlyphSignature,
  isGlyph,
  isGlyphGroup,
  resolveGlyph,
} from "./utils";

/**
 * Compare two individual glyphs (or signatures/records).
 */
export function CompareGlyphs(
  a: Glyph | GlyphSignature,
  b: Glyph | GlyphSignature,
  _options: GlyphComparisonOptions = {},
): GlyphComparisonResult {
  const left = resolveGlyph(a);
  const right = resolveGlyph(b);

  if (left.length !== right.length) {
    throw new Error(
      `Glyph size mismatch: ${left.length} vs ${right.length}`,
    );
  }

  const size = left.length;

  if (size === 0) {
    return { similarity: 1, distance: 0, matches: 0, size: 0 };
  }

  let matches = 0;
  for (let i = 0; i < size; i++) {
    if (left[i] === right[i]) {
      matches += 1;
    }
  }

  return {
    similarity: matches / size,
    distance: size - matches,
    matches,
    size,
  };
}

/**
 * Compare glyphs or groups.
 * Routes to CompareGroups when either side is a group, otherwise CompareGlyphs.
 */
export function Compare(
  a: Glyph | GlyphSignature | GlyphGroup,
  b: Glyph | GlyphSignature | GlyphGroup,
  options: GlyphComparisonOptions = {},
): GlyphComparisonResult {
  if (isGlyphGroup(a) || isGlyphGroup(b)) {
    return CompareGroups(asGroup(a), asGroup(b), options);
  }

  return CompareGlyphs(
    a as Glyph | GlyphSignature,
    b as Glyph | GlyphSignature,
    options,
  );
}

function asGroup(
  value: Glyph | GlyphSignature | GlyphGroup,
): GlyphGroup {
  if (isGlyphGroup(value)) {
    return value;
  }

  if (isGlyph(value) || IsGlyphSignature(value)) {
    return [resolveGlyph(value)];
  }

  throw new Error("Unsupported compare input");
}
