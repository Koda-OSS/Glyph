import { describe, expect, it } from "vitest";
import { create, createGroup, index, query } from "../index";

describe("glyph query index", () => {
  it("supports set/get/has/remove/size/clear", () => {
    const idx = index.new();
    const glyph = create("hello world").glyph;

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

  it("promotes a single glyph to a group on add", () => {
    const idx = index.new();
    const a = create("alpha").glyph;
    const b = create("beta").glyph;

    idx.set("doc", a);
    idx.add("doc", b);

    const value = idx.get("doc");
    expect(Array.isArray(value)).toBe(true);
    expect(value).toHaveLength(2);
  });

  it("creates a key on add when missing", () => {
    const idx = index.new();
    const glyph = create("fresh key").glyph;
    idx.add("new", glyph);
    expect(idx.get("new")).toBe(glyph);
  });

  it("merges into record groups with auto keys", () => {
    const idx = index.new();
    const a = create("one").glyph;
    const b = create("two").glyph;
    const c = create("three").glyph;

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

describe("glyph query", () => {
  it("ranks matches and respects limit/threshold", () => {
    const idx = index.new();
    idx.set("moon", create("Goodbye moon").glyph);
    idx.set("sun", create("Goodbye sun").glyph);
    idx.set("pasta", create("totally unrelated pasta recipe").glyph);

    const results = query(create("Goodbye moon").glyph, idx, {
      threshold: 0.1,
      limit: 2,
    });

    expect(results).toHaveLength(2);
    expect(results[0]!.key).toBe("moon");
    expect(results[0]!.similarity).toBe(1);
    expect(results[1]!.key).toBe("sun");
    expect(results[1]!.similarity).toBeGreaterThan(0.1);
  });

  it("normalizes scores by dividing by the top score", () => {
    const idx = index.new();
    idx.set("moon", create("Goodbye moon").glyph);
    idx.set("sun", create("Goodbye sun").glyph);

    const results = query(create("Goodbye moon").glyph, idx, {
      normalize: true,
    });

    expect(results[0]!.similarity).toBe(1);
    expect(results[1]!.similarity).toBeLessThan(1);
    expect(results[1]!.similarity).toBeGreaterThan(0);
  });

  it("sets matched for array and record groups", () => {
    const idx = index.new();
    const moon = create("Goodbye moon").glyph;
    const pasta = create("totally unrelated pasta recipe").glyph;

    idx.set("array-doc", [pasta, moon]);
    idx.set("record-doc", { noise: pasta, hit: moon });

    const results = query(moon, idx);
    const arrayHit = results.find((result) => result.key === "array-doc");
    const recordHit = results.find((result) => result.key === "record-doc");

    expect(arrayHit?.matched).toBe(1);
    expect(recordHit?.matched).toBe("hit");
  });

  it("finds the best doc when querying a group against singles", () => {
    const idx = index.new();
    idx.set("a", create("serialize glyphs to strings").glyph);
    idx.set("b", create("compare two fingerprints").glyph);

    const results = query(
      createGroup(["how to serialize a glyph", "encode fingerprint"]),
      idx,
      { limit: 1 },
    );

    expect(results[0]!.key).toBe("a");
  });
});
