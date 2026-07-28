import type { Glyph, GlyphGroup, GlyphSignature } from "../types";

const FILTER_REGEX = /[^a-z0-9!@#$%^&*()_\-+=~`<>,.?/"':;}{\[\] ]/g;
const STRIP_REGEX = /[^a-z0-9]/g;

export function TextFilter(text: string): string {
  return text.toLowerCase().replace(FILTER_REGEX, "");
}

export function isGlyph(value: unknown): value is Glyph {
  return value instanceof Uint32Array;
}

export function isGlyphGroup(value: unknown): value is GlyphGroup {
  if (isGlyph(value) || IsGlyphSignature(value)) {
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

export function resolveGlyph(value: Glyph | GlyphSignature): Glyph {
  if (isGlyph(value)) {
    return value;
  }

  return value.glyph;
}

export function resolveGlyphsToArray(group: Glyph | GlyphGroup): Glyph[] {
  if (isGlyph(group)) {
    return [group];
  }

  return Array.isArray(group) ? group : Object.values(group);
}

export function IsGlyphSignature(
  value: unknown,
): value is GlyphSignature {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    typeof (value as GlyphSignature).version === "number" &&
    "glyph" in value &&
    isGlyph((value as GlyphSignature).glyph)
  );
}

export function TextStrip(text: string): string {
  return TextFilter(text).replace(STRIP_REGEX, "");
}
