import type { Glyph, GlyphGroup, GlyphGroupInput } from "../../types";
import { isGlyph, NormalizeGroup } from "../utils";

export type IndexValue = Glyph | GlyphGroup;
export type IndexInput = Glyph | GlyphGroupInput;

export function normalizeStoredValue(value: IndexInput): IndexValue {
  if (isGlyph(value)) {
    return value;
  }

  return NormalizeGroup(value);
}

export function mergeRecordGroup(
  existing: GlyphGroup,
  incoming: Glyph[],
): GlyphGroup {
  const next: GlyphGroup = { ...existing };
  let cursor = 0;

  for (const glyph of incoming) {
    while (Object.prototype.hasOwnProperty.call(next, String(cursor))) {
      cursor += 1;
    }
    next[String(cursor)] = glyph;
    cursor += 1;
  }

  return next;
}

/**
 * Flatten a stored value or input into individual glyphs.
 */
export function flattenToGlyphs(value: IndexValue | IndexInput): Glyph[] {
  if (isGlyph(value)) {
    return [value];
  }

  if (Array.isArray(value)) {
    return [...value];
  }

  return Object.values(value);
}

/**
 * Assert every glyph shares the same length; return that length.
 */
export function assertUniformGlyphSize(
  glyphs: Glyph[],
  expected?: number,
): number {
  if (glyphs.length === 0) {
    if (expected === undefined) {
      throw new Error("Cannot determine glyph size from empty input");
    }
    return expected;
  }

  const size = expected ?? glyphs[0]!.length;

  for (const glyph of glyphs) {
    if (glyph.length !== size) {
      throw new Error(
        `Glyph size mismatch: expected ${size}, received ${glyph.length}`,
      );
    }
  }

  return size;
}
