import { describe, expect, it } from "vitest";
import type { CollectionAggregator, Glyph, GlyphGroup } from "../types";
import {
  CollectionAggregatorMax,
  CollectionAggregatorMean,
  CollectionAggregatorMid,
  CollectionAggregatorMin,
  CollectionAggregatorSoftmax,
  CollectionAggregatorSum,
  normalizeSlot,
  rebuildAggregatedGlyph,
} from "./aggregate";

function glyphOf(...slots: number[]): Glyph {
  return Uint32Array.from(slots) as Glyph;
}

describe("normalizeSlot", () => {
  it("rounds and clamps to uint32 range", () => {
    expect(normalizeSlot(1.4)).toBe(1);
    expect(normalizeSlot(1.6)).toBe(2);
    expect(normalizeSlot(-5)).toBe(0);
    expect(normalizeSlot(Number.POSITIVE_INFINITY)).toBe(0);
    expect(normalizeSlot(0xffffffff + 10)).toBe(0xffffffff);
  });
});

describe("CollectionAggregator built-ins", () => {
  const values = [10, 30, 20];

  it("Min returns the smallest value", () => {
    expect(CollectionAggregatorMin(values)).toBe(10);
  });

  it("Max returns the largest value", () => {
    expect(CollectionAggregatorMax(values)).toBe(30);
  });

  it("Mean returns the arithmetic average", () => {
    expect(CollectionAggregatorMean(values)).toBe(20);
  });

  it("Mid returns the midpoint of min and max", () => {
    expect(CollectionAggregatorMid(values)).toBe(20);
  });

  it("Sum returns the total", () => {
    expect(CollectionAggregatorSum(values)).toBe(60);
  });

  it("Softmax returns the power mean with exponent 3", () => {
    // (10³ + 30³ + 20³) / 3 = (1000 + 27000 + 8000) / 3 = 12000
    // 12000 ** (1/3) ≈ 22.907
    const expected = (12000) ** (1 / 3);
    expect(CollectionAggregatorSoftmax(values)).toBeCloseTo(expected, 5);
  });
});

describe("rebuildAggregatedGlyph", () => {
  it("returns a zero-filled glyph when the collection is empty", () => {
    const out = rebuildAggregatedGlyph({}, CollectionAggregatorMin, 4);
    expect(out).toEqual(new Uint32Array(4));
  });

  it("aggregates Min across slots", () => {
    const collection: GlyphGroup = {
      a: glyphOf(1, 9, 5),
      b: glyphOf(3, 2, 8),
    };
    const out = rebuildAggregatedGlyph(
      collection,
      CollectionAggregatorMin,
      3,
    );
    expect([...out]).toEqual([1, 2, 5]);
  });

  it("aggregates Max across slots", () => {
    const collection: GlyphGroup = {
      a: glyphOf(1, 9, 5),
      b: glyphOf(3, 2, 8),
    };
    const out = rebuildAggregatedGlyph(
      collection,
      CollectionAggregatorMax,
      3,
    );
    expect([...out]).toEqual([3, 9, 8]);
  });

  it("passes values, index, and collection to a custom aggregator", () => {
    const collection: GlyphGroup = {
      a: glyphOf(10, 20),
      b: glyphOf(30, 40),
    };
    const seen: Array<{
      values: number[];
      index: number;
      keys: string[];
    }> = [];

    const custom: CollectionAggregator = (values, context) => {
      seen.push({
        values: [...values],
        index: context!.index,
        keys: Object.keys(context!.collection).sort(),
      });
      return values[0]!;
    };

    rebuildAggregatedGlyph(collection, custom, 2);

    expect(seen).toHaveLength(2);
    expect(seen[0]!.index).toBe(0);
    expect(seen[1]!.index).toBe(1);
    expect(seen[0]!.keys).toEqual(["a", "b"]);
    expect(seen[0]!.values).toEqual([10, 30]);
    expect(seen[1]!.values).toEqual([20, 40]);
  });

  it("throws when glyph sizes differ", () => {
    const collection: GlyphGroup = {
      a: glyphOf(1, 2),
      b: glyphOf(1, 2, 3),
    };
    expect(() =>
      rebuildAggregatedGlyph(collection, CollectionAggregatorMin, 2),
    ).toThrow(/size mismatch/);
  });
});
