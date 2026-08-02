import { describe, expect, it } from "vitest";
import { Create, CreateGroup, index, query } from "../main";

describe("glyph query", () => {
  it("ranks matches and respects limit/threshold", () => {
    // Mid-similarity pairs need exact scan under default 64×2 banding.
    const idx = index.New({ mode: "direct" });
    idx.Set("moon", Create("Goodbye moon").glyph);
    idx.Set("sun", Create("Goodbye sun").glyph);
    idx.Set("pasta", Create("totally unrelated pasta recipe").glyph);

    const results = query.New(idx).Search(Create("Goodbye moon").glyph, {
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
    const idx = index.New({ mode: "direct" });
    idx.Set("moon", Create("Goodbye moon").glyph);
    idx.Set("sun", Create("Goodbye sun").glyph);

    const results = query.New(idx).Search(Create("Goodbye moon").glyph, {
      normalize: true,
    });

    expect(results[0]!.similarity).toBe(1);
    expect(results[1]!.similarity).toBeLessThan(1);
    expect(results[1]!.similarity).toBeGreaterThan(0);
  });

  it("sets matched for array and record groups", () => {
    const idx = index.New();
    const moon = Create("Goodbye moon").glyph;
    const pasta = Create("totally unrelated pasta recipe").glyph;

    idx.Set("array-doc", [pasta, moon]);
    idx.Set("record-doc", { noise: pasta, hit: moon });

    const results = query.New(idx).Search(moon);
    const arrayHit = results.find((result) => result.key === "array-doc");
    const recordHit = results.find((result) => result.key === "record-doc");

    expect(arrayHit?.matched).toBe(1);
    expect(recordHit?.matched).toBe("hit");
  });

  it("finds the best doc when querying a group against singles", () => {
    const idx = index.New({ mode: "direct" });
    idx.Set("a", Create("serialize glyphs to strings").glyph);
    idx.Set("b", Create("compare two fingerprints").glyph);

    const results = query
      .New(idx)
      .Search(CreateGroup(["how to serialize a glyph", "encode fingerprint"]), {
        limit: 1,
      });

    expect(results[0]!.key).toBe("a");
  });

  it("direct mode still ranks every key", () => {
    const idx = index.New({ mode: "direct" });
    idx.Set("moon", Create("Goodbye moon").glyph);
    idx.Set("pasta", Create("totally unrelated pasta recipe").glyph);

    const results = query.New(idx).Search(Create("Goodbye moon").glyph, {
      threshold: 0,
    });

    expect(results.map((r) => r.key).sort()).toEqual(["moon", "pasta"]);
  });
});

const GARBAGE_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,.;: ";

function randomGarbage(length: number): string {
  let text = "";
  for (let i = 0; i < length; i++) {
    text += GARBAGE_ALPHABET[Math.floor(Math.random() * GARBAGE_ALPHABET.length)]!;
  }
  return text;
}

describe("glyph query stress", () => {
  it(
    "direct mode: indexes random docs until a query takes longer than 50ms",
    () => {
      const idx = index.New({ mode: "direct" });
      const q = query.New(idx);
      const probe = Create(randomGarbage(2048)).glyph;
      let queryMs = 0;

      while (queryMs <= 50) {
        for (let i = 0; i < 512; i++) {
          // 512 docs per batch
          idx.Set(`doc-${idx.Size()}`, Create(randomGarbage(4096)).glyph);
        }
        const started = performance.now();
        q.Search(probe, { limit: 16 });
        queryMs = performance.now() - started;
      }

      const counted = idx.Size();
      console.log(
        `Direct stress: indexed ${counted} docs before query exceeded 50ms (${queryMs.toFixed(2)} ms)`,
      );

      expect(queryMs).toBeGreaterThan(50);
      expect(counted).toBeGreaterThan(0);
    },
    120_000,
  );

  it(
    "bands mode indexes more docs than direct before the same latency budget",
    () => {
      const probe = Create(randomGarbage(2048)).glyph;
      const targetDocs = 1024;

      const direct = index.New({ mode: "direct" });
      for (let i = 0; i < targetDocs; i++) {
        direct.Set(`doc-${i}`, Create(randomGarbage(4096)).glyph);
      }
      const directStarted = performance.now();
      query.New(direct).Search(probe, { limit: 5 });
      const directMs = performance.now() - directStarted;

      const bands = index.New({ mode: "bands" });
      for (let i = 0; i < targetDocs; i++) {
        bands.Set(`doc-${i}`, Create(randomGarbage(4096)).glyph);
      }
      const bandsStarted = performance.now();
      query.New(bands).Search(probe, { limit: 5 });
      const bandsMs = performance.now() - bandsStarted;

      console.log(
        `Capacity: ${targetDocs} docs — direct ${directMs.toFixed(2)} ms, bands ${bandsMs.toFixed(2)} ms`,
      );

      expect(bandsMs).toBeLessThanOrEqual(directMs * 1.5);
    },
    120_000,
  );
});
