import { describe, expect, it } from "vitest";
import { Create, index, query } from "../../index";
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
    index.new(mode === "bands" ? { mode: "bands" } : { mode: "direct" });

  it("supports set/get/has/remove/size/clear", () => {
    const idx = create();
    expect(idx.mode).toBe(mode);
    const glyph = Create("hello world").glyph;

    expect(idx.size()).toBe(0);
    idx.set("a", glyph);
    expect(idx.has("a")).toBe(true);
    expect(idx.get("a")).toBe(glyph);
    expect(idx.size()).toBe(1);

    idx.set("a");
    expect(idx.has("a")).toBe(false);
    expect(idx.size()).toBe(0);

    idx.set("b", glyph);
    idx.remove("b");
    expect(idx.has("b")).toBe(false);

    idx.set("c", glyph);
    idx.clear();
    expect(idx.size()).toBe(0);
  });

  it("promotes a single glyph to a map group on add", () => {
    const idx = create();
    const a = Create("alpha").glyph;
    const b = Create("beta").glyph;

    idx.set("doc", a);
    idx.add("doc", b);

    const value = idx.get("doc");
    expect(Array.isArray(value)).toBe(false);
    expect(value).toEqual({ "0": a, "1": b });
  });

  it("creates a key on add when missing", () => {
    const idx = create();
    const glyph = Create("fresh key").glyph;
    idx.add("new", glyph);
    expect(idx.get("new")).toBe(glyph);
  });

  it("normalizes array set into a map", () => {
    const idx = create();
    const a = Create("one").glyph;
    const b = Create("two").glyph;

    idx.set("doc", [a, b]);
    expect(idx.get("doc")).toEqual({ "0": a, "1": b });
  });

  it("merges into record groups with auto keys", () => {
    const idx = create();
    const a = Create("one").glyph;
    const b = Create("two").glyph;
    const c = Create("three").glyph;

    idx.set("doc", { title: a });
    idx.add("doc", [b, c]);

    const value = idx.get("doc");
    expect(value).toMatchObject({
      title: a,
      "0": b,
      "1": c,
    });
  });
});

describe("glyph index bands", () => {
  it("defaults to bands mode", () => {
    expect(index.new().mode).toBe("bands");
  });

  it("candidateKeys finds exact and near-duplicate matches", () => {
    const idx = index.new();
    const moon = Create("Goodbye moon under the quiet stars tonight").glyph;
    const near = Create(
      "Goodbye moon under the quiet stars tonight again",
    ).glyph;
    const pasta = Create("totally unrelated pasta recipe").glyph;

    idx.set("moon", moon);
    idx.set("near", near);
    idx.set("pasta", pasta);

    const candidates = [...idx.candidateKeys(moon)];
    expect(candidates).toContain("moon");
    expect(candidates).toContain("near");
  });

  it("remove clears band membership", () => {
    const idx = index.new();
    const moon = Create("Goodbye moon").glyph;
    idx.set("moon", moon);
    idx.remove("moon");

    expect([...idx.candidateKeys(moon)]).toEqual([]);
  });

  it("rejects glyph size mismatch", () => {
    const idx = index.new({ glyphSize: 128 });
    idx.set("a", Create("alpha").glyph);
    expect(() =>
      idx.set("b", Create("beta", { size: 64 }).glyph),
    ).toThrow(/Glyph size mismatch/);
  });

  it("requires bands/rows for non-128 sizes", () => {
    const idx = index.new();
    expect(() =>
      idx.set("a", Create("alpha", { size: 64 }).glyph),
    ).toThrow(/bands\/rows required/);
  });

  it("accepts explicit bands for size 64", () => {
    const idx = index.new({ bands: 8, rows: 8 });
    const glyph = Create("alpha", { size: 64 }).glyph;
    idx.set("a", glyph);
    expect([...idx.candidateKeys(glyph)]).toContain("a");
  });

  it("hashBand is stable for identical slices", () => {
    const glyph = Create("stable band hash").glyph;
    expect(hashBand(glyph, 0, 2)).toBe(hashBand(glyph, 0, 2));
    expect(hashBand(glyph, 0, 2)).not.toBe(hashBand(glyph, 1, 2));
  });
});

describe("glyph index direct candidateKeys", () => {
  it("yields every key", () => {
    const idx = index.new({ mode: "direct" });
    idx.set("a", Create("a").glyph);
    idx.set("b", Create("b").glyph);
    expect([...idx.candidateKeys(Create("a").glyph)].sort()).toEqual([
      "a",
      "b",
    ]);
  });
});

describe("bands query smoke", () => {
  it("ranks exact and near-duplicate hits via default bands index", () => {
    const idx = index.new();
    const probeText = "Goodbye moon under the quiet stars tonight";
    idx.set("moon", Create(probeText).glyph);
    idx.set(
      "near",
      Create("Goodbye moon under the quiet stars tonight again").glyph,
    );
    idx.set("pasta", Create("totally unrelated pasta recipe").glyph);

    const results = query(Create(probeText).glyph, idx, {
      threshold: 0.1,
      limit: 2,
    });

    expect(results).toHaveLength(2);
    expect(results[0]!.key).toBe("moon");
    expect(results[1]!.key).toBe("near");
  });
});
