import { describe, expect, it } from "vitest";
import {
  CollectionAggregatorMax,
  CollectionAggregatorMin,
  Create,
  collections,
} from "../main";

describe("glyph collections", () => {
  it("adds strings and glyphs, supports Has/Count/Remove/Clear", () => {
    const col = collections.New({ create: { size: 32 } });
    const glyph = Create("prebuilt glyph", { size: 32 }).glyph;

    expect(col.Count()).toBe(0);
    expect(col.Has("a")).toBe(false);
    expect(col.glyph.length).toBe(32);
    expect([...col.glyph].every((v) => v === 0)).toBe(true);

    col.Add("a", "hello world");
    col.Add("b", glyph);

    expect(col.Has("a")).toBe(true);
    expect(col.Has("b")).toBe(true);
    expect(col.Count()).toBe(2);
    expect(col.Collection().b).toBe(glyph);

    col.Add("a", "overwrite me");
    expect(col.Count()).toBe(2);

    col.Remove("a");
    expect(col.Has("a")).toBe(false);
    expect(col.Count()).toBe(1);

    col.Clear();
    expect(col.Count()).toBe(0);
    expect(col.Has("b")).toBe(false);
    expect([...col.glyph].every((v) => v === 0)).toBe(true);
  });

  it("AddGroup merges record keys and normalizes arrays", () => {
    const col = collections.New({ create: { size: 32 } });
    const a = Create("alpha", { size: 32 }).glyph;
    const b = Create("beta", { size: 32 }).glyph;
    const c = Create("gamma", { size: 32 }).glyph;

    col.Add("keep", Create("keep me", { size: 32 }).glyph);
    col.AddGroup({ a, b });
    col.AddGroup({ b: c });

    expect(col.Count()).toBe(3);
    expect(col.Collection().a).toBe(a);
    expect(col.Collection().b).toBe(c);
    expect(col.Has("keep")).toBe(true);

    col.AddGroup([a, b]);
    expect(col.Collection()["0"]).toBe(a);
    expect(col.Collection()["1"]).toBe(b);
    expect(col.Count()).toBe(5);
  });

  it("Collection returns a snapshot copy", () => {
    const col = collections.New({ create: { size: 32 } });
    col.Add("x", "example text");

    const snap = col.Collection();
    delete snap.x;
    snap.y = Create("injected", { size: 32 }).glyph;

    expect(col.Has("x")).toBe(true);
    expect(col.Has("y")).toBe(false);
    expect(col.Count()).toBe(1);
  });

  it("rebuilds glyph with Min by default after mutations", () => {
    const a = Uint32Array.from([1, 9, 5]) as ReturnType<
      typeof Create
    >["glyph"];
    const b = Uint32Array.from([3, 2, 8]) as ReturnType<
      typeof Create
    >["glyph"];

    const col = collections.New({
      create: { size: 3 },
      aggregator: CollectionAggregatorMin,
    });

    col.Add("a", a);
    expect([...col.glyph]).toEqual([1, 9, 5]);

    col.Add("b", b);
    expect([...col.glyph]).toEqual([1, 2, 5]);

    col.Remove("a");
    expect([...col.glyph]).toEqual([3, 2, 8]);
  });

  it("supports Max aggregator", () => {
    const a = Uint32Array.from([1, 9, 5]) as ReturnType<
      typeof Create
    >["glyph"];
    const b = Uint32Array.from([3, 2, 8]) as ReturnType<
      typeof Create
    >["glyph"];

    const col = collections.New({
      create: { size: 3 },
      aggregator: CollectionAggregatorMax,
    });

    col.Add("a", a);
    col.Add("b", b);
    expect([...col.glyph]).toEqual([3, 9, 8]);
  });

  it("throws on glyph size mismatch", () => {
    const col = collections.New({ create: { size: 4 } });
    col.Add("a", Uint32Array.from([1, 2, 3, 4]) as ReturnType<
      typeof Create
    >["glyph"]);

    expect(() =>
      col.Add(
        "b",
        Uint32Array.from([1, 2]) as ReturnType<typeof Create>["glyph"],
      ),
    ).toThrow(/size mismatch/);
  });
});
