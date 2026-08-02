import type { Glyph, GlyphGroup, GlyphGroupInput } from "../types";
import { isGlyph, isGlyphSignature } from "./glyph";

const NUMERIC_KEY = /^\d+$/;

/**
 * Detect group input forms: non-empty glyph array or non-empty glyph record.
 */
export function isGlyphGroup(value: unknown): value is GlyphGroupInput {
  if (isGlyph(value) || isGlyphSignature(value)) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0 && value.every(isGlyph);
  }

  if (typeof value === "object" && value !== null) {
    const values = Object.values(value as Record<string, unknown>);
    return values.length > 0 && values.every(isGlyph);
  }

  return false;
}

/**
 * Normalize a single glyph or group input into a map.
 * Arrays become `{ "0": g0, "1": g1, ... }`.
 */
export function normalizeGroup(input: Glyph | GlyphGroupInput): GlyphGroup {
  if (isGlyph(input)) {
    return { "0": input };
  }

  if (Array.isArray(input)) {
    const group: GlyphGroup = {};
    for (let i = 0; i < input.length; i++) {
      group[String(i)] = input[i]!;
    }
    return group;
  }

  return { ...input };
}

/**
 * Stable iteration order for pairwise compare:
 * numeric keys sorted numerically, then other keys lexicographically.
 */
export function groupEntries(
  group: GlyphGroup,
): Array<{ key: string; glyph: Glyph }> {
  const keys = Object.keys(group).sort((a, b) => {
    const aNumeric = NUMERIC_KEY.test(a);
    const bNumeric = NUMERIC_KEY.test(b);

    if (aNumeric && bNumeric) {
      return Number(a) - Number(b);
    }
    if (aNumeric) {
      return -1;
    }
    if (bNumeric) {
      return 1;
    }
    return a < b ? -1 : a > b ? 1 : 0;
  });

  return keys.map((key) => ({ key, glyph: group[key]! }));
}

/**
 * Coerce pure-digit map keys back to numbers for matched attribution.
 */
export function toMatchedKey(key: string): string | number {
  return NUMERIC_KEY.test(key) ? Number(key) : key;
}
