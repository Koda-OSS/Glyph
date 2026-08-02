import { describe, expect, it } from "vitest";
import { Create, index, query } from "../main";
import { resolveBandConfig, hashBand } from "./in_bands";

describe("resolveBandConfig", () => {
  it("defaults 128 to 64×2", () => {
    expect(resolveBandConfig(128)).toEqual({
      bands: 64,
      rows: 2,
      glyphSize: 128,
    });
  });

  it("derives rows from bands", () => {
    expect(resolveBandConfig(64, { bands: 8 })).toEqual({
      bands: 8,
      rows: 8,
      glyphSize: 64,
    });
  });

  it("throws when bands * rows !== glyphSize", () => {
    expect(() => resolveBandConfig(128, { bands: 10, rows: 10 })).toThrow(
      /bands \* rows/,
    );
  });

  it("throws for non-128 without bands/rows", () => {
    expect(() => resolveBandConfig(64)).toThrow(/bands\/rows required/);
  });
});

describe.each(["bands", "direct"] as const)("glyph index (%s)", (mode) => {
  const create = () =>
    index.New(mode === "bands" ? { mode: "bands" } : { mode: "direct" });

  it("supports Set/Get/Has/Remove/Size/Clear", () => {
    const idx = create();
    expect(idx.mode).toBe(mode);
    const glyph = Create("hello world").glyph;

    expect(idx.Size()).toBe(0);
    idx.Set("a", glyph);
    expect(idx.Has("a")).toBe(true);
    expect(idx.Get("a")).toBe(glyph);
    expect(idx.Size()).toBe(1);

    idx.Set("a");
    expect(idx.Has("a")).toBe(false);
    expect(idx.Size()).toBe(0);

    idx.Set("b", glyph);
    idx.Remove("b");
    expect(idx.Has("b")).toBe(false);

    idx.Set("c", glyph);
    idx.Clear();
    expect(idx.Size()).toBe(0);
  });

  it("promotes a single glyph to a map group on Add", () => {
    const idx = create();
    const a = Create("alpha").glyph;
    const b = Create("beta").glyph;

    idx.Set("doc", a);
    idx.Add("doc", b);

    const value = idx.Get("doc");
    expect(Array.isArray(value)).toBe(false);
    expect(value).toEqual({ "0": a, "1": b });
  });

  it("creates a key on Add when missing", () => {
    const idx = create();
    const glyph = Create("fresh key").glyph;
    idx.Add("new", glyph);
    expect(idx.Get("new")).toBe(glyph);
  });

  it("normalizes array Set into a map", () => {
    const idx = create();
    const a = Create("one").glyph;
    const b = Create("two").glyph;

    idx.Set("doc", [a, b]);
    expect(idx.Get("doc")).toEqual({ "0": a, "1": b });
  });

  it("merges into record groups with auto keys", () => {
    const idx = create();
    const a = Create("one").glyph;
    const b = Create("two").glyph;
    const c = Create("three").glyph;

    idx.Set("doc", { title: a });
    idx.Add("doc", [b, c]);

    const value = idx.Get("doc");
    expect(value).toMatchObject({
      title: a,
      "0": b,
      "1": c,
    });
  });
});

describe("glyph index bands", () => {
  it("defaults to bands mode", () => {
    expect(index.New().mode).toBe("bands");
  });

  it("CandidateKeys finds exact and near-duplicate matches", () => {
    const idx = index.New();
    const moon = Create("Goodbye moon under the quiet stars tonight").glyph;
    const near = Create(
      "Goodbye moon under the quiet stars tonight again",
    ).glyph;
    const pasta = Create("totally unrelated pasta recipe").glyph;

    idx.Set("moon", moon);
    idx.Set("near", near);
    idx.Set("pasta", pasta);

    const candidates = [...idx.CandidateKeys(moon)];
    expect(candidates).toContain("moon");
    expect(candidates).toContain("near");
  });

  it("Remove clears band membership", () => {
    const idx = index.New();
    const moon = Create("Goodbye moon").glyph;
    idx.Set("moon", moon);
    idx.Remove("moon");

    expect([...idx.CandidateKeys(moon)]).toEqual([]);
  });

  it("rejects glyph size mismatch", () => {
    const idx = index.New({ glyphSize: 128 });
    idx.Set("a", Create("alpha").glyph);
    expect(() =>
      idx.Set("b", Create("beta", { size: 64 }).glyph),
    ).toThrow(/Glyph size mismatch/);
  });

  it("requires bands/rows for non-128 sizes", () => {
    const idx = index.New();
    expect(() =>
      idx.Set("a", Create("alpha", { size: 64 }).glyph),
    ).toThrow(/bands\/rows required/);
  });

  it("accepts explicit bands for size 64", () => {
    const idx = index.New({ bands: 8, rows: 8 });
    const glyph = Create("alpha", { size: 64 }).glyph;
    idx.Set("a", glyph);
    expect([...idx.CandidateKeys(glyph)]).toContain("a");
  });

  it("hashBand is stable for identical slices", () => {
    const glyph = Create("stable band hash").glyph;
    expect(hashBand(glyph, 0, 2)).toBe(hashBand(glyph, 0, 2));
    expect(hashBand(glyph, 0, 2)).not.toBe(hashBand(glyph, 1, 2));
  });
});

describe("glyph index direct CandidateKeys", () => {
  it("yields every key", () => {
    const idx = index.New({ mode: "direct" });
    idx.Set("a", Create("a").glyph);
    idx.Set("b", Create("b").glyph);
    expect([...idx.CandidateKeys(Create("a").glyph)].sort()).toEqual([
      "a",
      "b",
    ]);
  });
});

describe("bands query smoke", () => {
  it("ranks exact and near-duplicate hits via default bands index", () => {
    const idx = index.New();
    const probeText = "Goodbye moon under the quiet stars tonight";
    idx.Set("moon", Create(probeText).glyph);
    idx.Set(
      "near",
      Create("Goodbye moon under the quiet stars tonight again").glyph,
    );
    idx.Set("pasta", Create("totally unrelated pasta recipe").glyph);

    const results = query.New(idx).Search(Create(probeText).glyph, {
      threshold: 0.1,
      limit: 2,
    });

    expect(results).toHaveLength(2);
    expect(results[0]!.key).toBe("moon");
    expect(results[1]!.key).toBe("near");
  });
});
