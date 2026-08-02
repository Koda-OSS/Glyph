import type {
  Glyph,
  GlyphComparisonOptions,
  GlyphComparisonResult,
  GlyphGroup,
  GlyphGroupInput,
  GlyphSignature,
} from "../types";
import { CompareGroups } from "./group";
import { isGlyph, isGlyphSignature, resolveGlyph } from "./glyph";
import { isGlyphGroup, normalizeGroup } from "./group-input";

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
  a: Glyph | GlyphSignature | GlyphGroupInput,
  b: Glyph | GlyphSignature | GlyphGroupInput,
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
  value: Glyph | GlyphSignature | GlyphGroupInput,
): GlyphGroup {
  if (isGlyphGroup(value) || isGlyph(value)) {
    return normalizeGroup(value);
  }

  if (isGlyphSignature(value)) {
    return normalizeGroup(resolveGlyph(value));
  }

  throw new Error("Unsupported compare input");
}
