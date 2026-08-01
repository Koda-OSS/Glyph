import { describe, expect, it } from "vitest";
import { Create, CreateGroup, index, query } from "../index";

describe("glyph query index", () => {
  it("supports set/get/has/remove/size/clear", () => {
    const idx = index.new();
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
    const idx = index.new();
    const a = Create("alpha").glyph;
    const b = Create("beta").glyph;

    idx.set("doc", a);
    idx.add("doc", b);

    const value = idx.get("doc");
    expect(Array.isArray(value)).toBe(false);
    expect(value).toEqual({ "0": a, "1": b });
  });

  it("creates a key on add when missing", () => {
    const idx = index.new();
    const glyph = Create("fresh key").glyph;
    idx.add("new", glyph);
    expect(idx.get("new")).toBe(glyph);
  });

  it("normalizes array set into a map", () => {
    const idx = index.new();
    const a = Create("one").glyph;
    const b = Create("two").glyph;

    idx.set("doc", [a, b]);
    expect(idx.get("doc")).toEqual({ "0": a, "1": b });
  });

  it("merges into record groups with auto keys", () => {
    const idx = index.new();
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

describe("glyph query", () => {
  it("ranks matches and respects limit/threshold", () => {
    const idx = index.new();
    idx.set("moon", Create("Goodbye moon").glyph);
    idx.set("sun", Create("Goodbye sun").glyph);
    idx.set("pasta", Create("totally unrelated pasta recipe").glyph);

    const results = query(Create("Goodbye moon").glyph, idx, {
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
    idx.set("moon", Create("Goodbye moon").glyph);
    idx.set("sun", Create("Goodbye sun").glyph);

    const results = query(Create("Goodbye moon").glyph, idx, {
      normalize: true,
    });

    expect(results[0]!.similarity).toBe(1);
    expect(results[1]!.similarity).toBeLessThan(1);
    expect(results[1]!.similarity).toBeGreaterThan(0);
  });

  it("sets matched for array and record groups", () => {
    const idx = index.new();
    const moon = Create("Goodbye moon").glyph;
    const pasta = Create("totally unrelated pasta recipe").glyph;

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
    idx.set("a", Create("serialize glyphs to strings").glyph);
    idx.set("b", Create("compare two fingerprints").glyph);

    const results = query(
      CreateGroup(["how to serialize a glyph", "encode fingerprint"]),
      idx,
      { limit: 1 },
    );

    expect(results[0]!.key).toBe("a");
  });
});

const GARBAGE_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomGarbage(length: number): string {
  let text = "";
  for (let i = 0; i < length; i++) {
    text += GARBAGE_ALPHABET[Math.floor(Math.random() * GARBAGE_ALPHABET.length)]!;
  }
  return text;
}

describe("glyph query stress", () => {
  it(
    "indexes random docs until a query takes longer than 10ms",
    () => {
      const idx = index.new();
      const probe = Create(randomGarbage(2048)).glyph;
      let queryMs = 0;

      while (queryMs <= 10) {
        idx.set(`doc-${idx.size()}`, Create(randomGarbage(4096)).glyph);

        const started = performance.now();
        query(probe, idx, { limit: 5 });
        queryMs = performance.now() - started;
      }

      const counted = idx.size();
      console.log(
        `Stress: indexed ${counted} docs before query exceeded 10ms (${queryMs.toFixed(2)} ms)`,
      );

      expect(queryMs).toBeGreaterThan(10);
      expect(counted).toBeGreaterThan(0);
    },
    120_000,
  );
});
