import { describe, expect, it } from "vitest";
import {
  Create,
  CreateGroup,
  GroupResultAggregatorMax,
  GroupResultAggregatorSum,
  spotlight,
} from "../main";
import { defaultSpotlightChunker } from "./chunker";

describe("defaultSpotlightChunker", () => {
  it("splits on sentence punctuation .!?;", () => {
    const chunks = defaultSpotlightChunker(
      "Hello world. How are you? Fine; thanks!",
    );
    expect(chunks).toEqual([
      "Hello world.",
      "How are you?",
      "Fine;",
      "thanks!",
    ]);
  });

  it("flushes at 128 words", () => {
    const words = Array.from({ length: 200 }, (_, i) => `w${i}`).join(" ");
    const chunks = defaultSpotlightChunker(words);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]!.split(/\s+/).filter(Boolean).length).toBe(128);
  });

  it("returns empty for blank input", () => {
    expect(defaultSpotlightChunker("   ")).toEqual([]);
  });

  it("returns one chunk when no splits", () => {
    expect(defaultSpotlightChunker("just one phrase")).toEqual([
      "just one phrase",
    ]);
  });
});

describe("spotlight document", () => {
  const sample =
    "Goodbye moon under quiet stars. Pasta recipe with tomato sauce. Goodbye moon again tonight.";

  it("compiles chunks and reports Size", () => {
    const doc = spotlight.New(sample);
    expect(doc.Size()).toBeGreaterThan(0);
    expect(doc.Chunks().length).toBe(doc.Size());
  });

  it("uses a custom chunker", () => {
    const doc = spotlight.New(sample, {
      chunker: (text) => text.split("|").map((s) => s.trim()).filter(Boolean),
    });
    expect(doc.Size()).toBe(1);
  });

  it("Chunks() returns a snapshot copy", () => {
    const doc = spotlight.New(sample);
    const snap = doc.Chunks();
    (snap as GlyphSpotlightCompiledChunkMutable[])[0]!.text = "mutated";
    expect(doc.Chunks()[0]!.text).not.toBe("mutated");
  });

  it("empty content yields empty Rank/Query", () => {
    const doc = spotlight.New("   ");
    expect(doc.Size()).toBe(0);
    expect(doc.Rank(Create("anything").glyph)).toEqual([]);
    expect(doc.Query(Create("anything").glyph)).toEqual([]);
  });

  it("Rank returns GlyphSpotlightResult[] sorted by score", () => {
    const doc = spotlight.New(sample);
    const probe = Create("Goodbye moon under quiet stars").glyph;
    const results = doc.Rank(probe);

    expect(results.length).toBe(doc.Size());
    expect(results[0]!).toMatchObject({
      text: expect.any(String),
      score: expect.any(Number),
      length: expect.any(Number),
    });
    expect(results[0]!.comparison).toBeDefined();
    expect(results[0]!.glyph).toBeInstanceOf(Uint32Array);

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
    }
    expect(results[0]!.score).toBeGreaterThan(results[results.length - 1]!.score);
  });

  it("Rank with textOutput returns string[] sorted by score", () => {
    const doc = spotlight.New(sample);
    const probe = Create("Goodbye moon under quiet stars").glyph;
    const texts = doc.Rank(probe, { textOutput: true });
    const full = doc.Rank(probe);

    expect(Array.isArray(texts)).toBe(true);
    expect(typeof texts[0]).toBe("string");
    expect(texts).toEqual(full.map((r) => r.text));
  });

  it("Query respects threshold and limit", () => {
    const doc = spotlight.New(sample);
    const probe = Create("Goodbye moon under quiet stars").glyph;

    const all = doc.Query(probe, { threshold: 0 });
    expect(all.length).toBe(doc.Size());

    const limited = doc.Query(probe, { threshold: 0, limit: 1 });
    expect(limited).toHaveLength(1);
    expect(limited[0]!.score).toBe(all[0]!.score);

    const high = doc.Query(probe, { threshold: 0.99 });
    expect(high.every((r) => r.score >= 0.99)).toBe(true);
  });

  it("Query with textOutput returns filtered string[]", () => {
    const doc = spotlight.New(sample);
    const probe = Create("Goodbye moon under quiet stars").glyph;
    const texts = doc.Query(probe, {
      threshold: 0,
      limit: 2,
      textOutput: true,
    });

    expect(texts).toHaveLength(2);
    expect(typeof texts[0]).toBe("string");
  });

  it("group probe uses sum aggregate by default", () => {
    const doc = spotlight.New(
      "serialize glyphs to strings please. compare two fingerprints carefully.",
    );
    const probe = CreateGroup([
      "how to serialize a glyph",
      "encode fingerprint",
    ]);

    const withSum = doc.Rank(probe);
    const withMax = doc.Rank(probe, { aggregate: GroupResultAggregatorMax });

    expect(withSum[0]!.score).toBeGreaterThanOrEqual(withMax[0]!.score);
    expect(GroupResultAggregatorSum).toBeDefined();
  });

  it("group probe may populate matched", () => {
    const doc = spotlight.New("Goodbye moon under quiet stars tonight.");
    const probe = {
      moon: Create("Goodbye moon under quiet stars").glyph,
      pasta: Create("totally unrelated pasta recipe").glyph,
    };

    const results = doc.Rank(probe);
    expect(results[0]!.matched).toBeDefined();
  });
});

type GlyphSpotlightCompiledChunkMutable = {
  text: string;
  glyph: Uint32Array;
  length: number;
};
