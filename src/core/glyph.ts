import type { Glyph, GlyphSignature } from "../types";

export function isGlyph(value: unknown): value is Glyph {
  return value instanceof Uint32Array;
}

export function isGlyphSignature(
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

export function resolveGlyph(value: Glyph | GlyphSignature): Glyph {
  if (isGlyph(value)) {
    return value;
  }

  return value.glyph;
}
