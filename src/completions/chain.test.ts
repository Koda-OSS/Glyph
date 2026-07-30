import { describe, expect, it } from "vitest";
import { completions } from "../index";

describe("glyph completions chain", () => {
  it("ingest builds expected state transitions", () => {
    const chain = completions.new({ order: 3 });
    chain.ingest("doc-a", "alpha beta gamma delta");

    expect(chain.size()).toBe(2);
    expect(chain.complete("alpha beta").map((r) => r.token)).toEqual(["gamma"]);
    expect(chain.complete("beta gamma").map((r) => r.token)).toEqual(["delta"]);
  });

  it("strips punctuation from chain tokens", () => {
    const chain = completions.new({ order: 3 });
    chain.ingest("doc-a", "hello, world! next word");

    expect(chain.complete("hello world").map((r) => r.token)).toEqual(["next"]);
    expect(chain.complete("hello, world!").map((r) => r.token)).toEqual(["next"]);
  });

  it("returns empty for unknown or short prefix", () => {
    const chain = completions.new({ order: 3 });
    chain.ingest("doc-a", "one two three four");

    expect(chain.complete("")).toEqual([]);
    expect(chain.complete("one")).toEqual([]);
    expect(chain.complete("missing context")).toEqual([]);
  });

  it("ranks candidates by glyph similarity to probe context", () => {
    const chain = completions.new({ order: 3, create: { size: 128 } });

    chain.ingest("moon-doc", "say goodbye moon farewell night");
    chain.ingest("sun-doc", "say goodbye sun hello day");
    chain.ingest("moon-doc-2", "say goodbye moon stars shine");

    const results = chain.complete("say goodbye", { limit: 5 });

    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0]!.token).toBe("moon");
    expect(results[0]!.score).toBeGreaterThan(
      results.find((r) => r.token === "sun")!.score,
    );
  });

  it("attaches the highest-scoring source key and glyph", () => {
    const chain = completions.new({ order: 3, create: { size: 128 } });

    chain.ingest("moon-doc", "say goodbye moon farewell night");
    chain.ingest("sun-doc", "say goodbye sun hello day");

    const moon = chain.complete("say goodbye").find((r) => r.token === "moon");
    const sun = chain.complete("say goodbye").find((r) => r.token === "sun");

    expect(moon?.source.key).toBe("moon-doc");
    expect(moon?.source.glyph).toBeInstanceOf(Uint32Array);
    expect(sun?.source.key).toBe("sun-doc");
  });

  it("uses count as tiebreak when glyph scores are equal", () => {
    const chain = completions.new({ order: 3, create: { size: 64 } });
    const doc = "please repeat next token";

    chain.ingest("a", doc);
    chain.ingest("a", doc);
    chain.ingest("a", doc);
    chain.ingest("b", "please repeat other token");

    const results = chain.complete("please repeat", { limit: 2 });
    expect(results[0]!.token).toBe("next");
    expect(results[0]!.count).toBe(3);
    expect(results[0]!.source.key).toBe("a");
    expect(results[1]!.token).toBe("other");
    expect(results[1]!.count).toBe(1);
    expect(results[1]!.source.key).toBe("b");
  });

  it("respects limit and minCount", () => {
    const chain = completions.new({ order: 3 });
    chain.ingest("doc-a", "one two three four five");

    expect(chain.complete("one two", { limit: 1 })).toHaveLength(1);
    expect(chain.complete("two three", { minCount: 99 })).toHaveLength(0);
  });

  it("supports clear and size lifecycle", () => {
    const chain = completions.new({ order: 3 });
    chain.ingest("doc-a", "alpha beta gamma");
    expect(chain.size()).toBe(1);

    chain.clear();
    expect(chain.size()).toBe(0);
    expect(chain.complete("alpha beta")).toEqual([]);
  });

  it("merges duplicate ingest weights for the same key on a transition", () => {
    const chain = completions.new({ order: 3 });
    const text = "same context next word";

    chain.ingest("doc-a", text);
    chain.ingest("doc-a", text);

    const results = chain.complete("same context", { limit: 1 });
    expect(results[0]!.count).toBe(2);
    expect(results[0]!.token).toBe("next");
    expect(results[0]!.source.key).toBe("doc-a");
  });

  it("defaults to order 3", () => {
    const chain = completions.new();
    chain.ingest("doc-a", "a b c d");

    expect(chain.complete("a")).toEqual([]);
    expect(chain.complete("a b").map((r) => r.token)).toEqual(["c"]);
  });

  it("supports order 1 with empty state key", () => {
    const chain = completions.new({ order: 1 });
    chain.ingest("doc-a", "only one two");

    expect(chain.size()).toBe(1);
    expect(chain.complete("").map((r) => r.token).sort()).toEqual([
      "one",
      "only",
      "two",
    ]);
  });
});

describe("glyph completions result shape", () => {
  it("includes token score count comparison and source", () => {
    const chain = completions.new({ order: 3 });
    chain.ingest("hello-doc", "hello world next");

    const [result] = chain.complete("hello world");
    expect(result).toMatchObject({
      token: "next",
      score: expect.any(Number),
      count: 1,
      comparison: {
        similarity: expect.any(Number),
        matches: expect.any(Number),
        distance: expect.any(Number),
        size: expect.any(Number),
      },
      source: {
        key: "hello-doc",
        glyph: expect.any(Uint32Array),
      },
    });
  });
});
