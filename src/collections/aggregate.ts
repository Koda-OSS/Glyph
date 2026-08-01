import type {
  CollectionAggregator,
  CollectionAggregatorContext,
  Glyph,
  GlyphGroup,
} from "../types";

const UINT32_MAX = 0xffffffff;

// Round and clamp an aggregator output to a valid uint32 slot value.
export function normalizeSlot(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const rounded = Math.round(value);
  if (rounded <= 0) {
    return 0;
  }
  if (rounded >= UINT32_MAX) {
    return UINT32_MAX;
  }
  return rounded;
}

// Per-slot minimum across member glyphs.
export const CollectionAggregatorMin: CollectionAggregator = (values) => {
  if (values.length === 0) {
    return 0;
  }
  return Math.min(...values);
};

// Per-slot maximum across member glyphs.
export const CollectionAggregatorMax: CollectionAggregator = (values) => {
  if (values.length === 0) {
    return 0;
  }
  return Math.max(...values);
};

// Per-slot arithmetic mean.
export const CollectionAggregatorMean: CollectionAggregator = (values) => {
  if (values.length === 0) {
    return 0;
  }
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total / values.length;
};

// Per-slot midpoint of min and max.
export const CollectionAggregatorMid: CollectionAggregator = (values) => {
  if (values.length === 0) {
    return 0;
  }
  return (Math.min(...values) + Math.max(...values)) / 2;
};

// Per-slot sum (clamped later by normalizeSlot).
export const CollectionAggregatorSum: CollectionAggregator = (values) => {
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total;
};

// Default: Power mean with exponent 3: (sum(v³) / n) ** (1/3).
export const CollectionAggregatorSoftmax: CollectionAggregator = (values) => {
  if (values.length === 0) {
    return 0;
  }
  let total = 0;
  for (const value of values) {
    total += value * value * value;
  }
  return (total / values.length) ** (1 / 3);
};

// Build a single glyph by running `aggregator` once per slot across all glyphs in `collection`. Empty collections return a zero-filled glyph.
export function rebuildAggregatedGlyph(
  collection: GlyphGroup,
  aggregator: CollectionAggregator,
  expectedEmptySize: number,
): Glyph {
  const glyphs = Object.values(collection);

  if (glyphs.length === 0) {
    return new Uint32Array(expectedEmptySize) as Glyph;
  }

  const size = glyphs[0]!.length;
  for (let i = 1; i < glyphs.length; i++) {
    if (glyphs[i]!.length !== size) {
      throw new Error(
        `Collection glyph size mismatch: expected ${size}, received ${glyphs[i]!.length}`,
      );
    }
  }

  const out = new Uint32Array(size) as Glyph;
  const values: number[] = new Array(glyphs.length);
  const context: CollectionAggregatorContext = {
    collection,
    index: 0,
  };

  for (let slot = 0; slot < size; slot++) {
    for (let g = 0; g < glyphs.length; g++) {
      values[g] = glyphs[g]![slot]!;
    }
    context.index = slot;
    out[slot] = normalizeSlot(aggregator(values, context));
  }

  return out;
}
