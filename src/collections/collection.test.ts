import { describe, expect, it } from "vitest";
import {
  CollectionQuery,
  collections,
  Create,
  index,
} from "../index";

describe("glyph collections", () => {
  it("adds strings and glyphs, supports Has/Count/Remove/Clear", () => {
    const col = collections.new({ create: { size: 32 } });
    const glyph = Create("prebuilt glyph", { size: 32 }).glyph;

    expect(col.Count()).toBe(0);
    expect(col.Has("a")).toBe(false);

    col.Add("a", "hello world");
    col.Add("b", glyph);

    expect(col.Has("a")).toBe(true);
    expect(col.Has("b")).toBe(true);
    expect(col.Count()).toBe(2);
    expect(col.Examples().b).toBe(glyph);

    col.Add("a", "overwrite me");
    expect(col.Count()).toBe(2);

    col.Remove("a");
    expect(col.Has("a")).toBe(false);
    expect(col.Count()).toBe(1);

    col.Clear();
    expect(col.Count()).toBe(0);
    expect(col.Has("b")).toBe(false);
  });

  it("AddGroup merges record keys and normalizes arrays", () => {
    const col = collections.new({ create: { size: 32 } });
    const a = Create("alpha", { size: 32 }).glyph;
    const b = Create("beta", { size: 32 }).glyph;
    const c = Create("gamma", { size: 32 }).glyph;

    col.Add("keep", Create("keep me", { size: 32 }).glyph);
    col.AddGroup({ a, b });
    col.AddGroup({ b: c });

    expect(col.Count()).toBe(3);
    expect(col.Examples().a).toBe(a);
    expect(col.Examples().b).toBe(c);
    expect(col.Has("keep")).toBe(true);

    col.AddGroup([a, b]);
    expect(col.Examples()["0"]).toBe(a);
    expect(col.Examples()["1"]).toBe(b);
    expect(col.Count()).toBe(5);
  });

  it("Examples returns a snapshot copy", () => {
    const col = collections.new({ create: { size: 32 } });
    col.Add("x", "example text");

    const snap = col.Examples();
    delete snap.x;
    snap.y = Create("injected", { size: 32 }).glyph;

    expect(col.Has("x")).toBe(true);
    expect(col.Has("y")).toBe(false);
    expect(col.Count()).toBe(1);
  });

  it("Query ranks index hits and rejects empty collections", () => {
    const col = collections.new({ create: { size: 64 } });
    const idx = index.new();

    expect(() => col.Query(idx)).toThrow(/empty collection/);

    col.Add("moon", "goodbye moon farewell night");
    col.Add("sun", "goodbye sun hello day");

    idx.set("doc-moon", Create("goodbye moon stars", { size: 64 }).glyph);
    idx.set("doc-sun", Create("goodbye sun bright", { size: 64 }).glyph);
    idx.set("pasta", Create("unrelated pasta recipe", { size: 64 }).glyph);

    const results = col.Query(idx, { limit: 2, threshold: 0 });

    expect(results.length).toBe(2);
    expect(results[0]!.similarity).toBeGreaterThanOrEqual(results[1]!.similarity);
    expect(["doc-moon", "doc-sun"]).toContain(results[0]!.key);
  });

  it("CollectionQuery matches collection.Query", () => {
    const col = collections.new({ create: { size: 64 } });
    const idx = index.new();

    col.Add("probe", "the quick brown fox");
    idx.set("a", Create("the quick brown fox jumps", { size: 64 }).glyph);
    idx.set("b", Create("completely different text", { size: 64 }).glyph);

    const viaMethod = col.Query(idx, { normalize: true });
    const viaFn = CollectionQuery(col, idx, { normalize: true });

    expect(viaFn).toEqual(viaMethod);
    expect(viaFn[0]!.key).toBe("a");
    expect(viaFn[0]!.similarity).toBe(1);
  });
});
