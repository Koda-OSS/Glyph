import { describe, expect, it } from "vitest";
import { completions } from "../main";

describe("glyph completions chain", () => {
  it("ingest builds expected state transitions", () => {
    const chain = completions.New({ order: 3 });
    chain.Ingest("doc-a", "alpha beta gamma delta");

    expect(chain.Size()).toBe(2);
    expect(chain.Complete("alpha beta").map((r) => r.token)).toEqual(["gamma"]);
    expect(chain.Complete("beta gamma").map((r) => r.token)).toEqual(["delta"]);
  });

  it("strips punctuation from chain tokens", () => {
    const chain = completions.New({ order: 3 });
    chain.Ingest("doc-a", "hello, world! next word");

    expect(chain.Complete("hello world").map((r) => r.token)).toEqual(["next"]);
    expect(chain.Complete("hello, world!").map((r) => r.token)).toEqual(["next"]);
  });

  it("returns empty for unknown or short prefix", () => {
    const chain = completions.New({ order: 3 });
    chain.Ingest("doc-a", "one two three four");

    expect(chain.Complete("")).toEqual([]);
    expect(chain.Complete("one")).toEqual([]);
    expect(chain.Complete("missing context")).toEqual([]);
  });

  it("ranks candidates by glyph similarity to probe context", () => {
    const chain = completions.New({ order: 3, create: { size: 128 } });

    chain.Ingest("moon-doc", "say goodbye moon farewell night");
    chain.Ingest("sun-doc", "say goodbye sun hello day");
    chain.Ingest("moon-doc-2", "say goodbye moon stars shine");

    const results = chain.Complete("say goodbye", { limit: 5 });

    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0]!.token).toBe("moon");
    expect(results[0]!.score).toBeGreaterThan(
      results.find((r) => r.token === "sun")!.score,
    );
  });

  it("attaches the highest-scoring source key and glyph", () => {
    const chain = completions.New({ order: 3, create: { size: 128 } });

    chain.Ingest("moon-doc", "say goodbye moon farewell night");
    chain.Ingest("sun-doc", "say goodbye sun hello day");

    const moon = chain.Complete("say goodbye").find((r) => r.token === "moon");
    const sun = chain.Complete("say goodbye").find((r) => r.token === "sun");

    expect(moon?.source.key).toBe("moon-doc");
    expect(moon?.source.glyph).toBeInstanceOf(Uint32Array);
    expect(sun?.source.key).toBe("sun-doc");
  });

  it("uses count as tiebreak when glyph scores are equal", () => {
    const chain = completions.New({ order: 3, create: { size: 64 } });
    const doc = "please repeat next token";

    chain.Ingest("a", doc);
    chain.Ingest("a", doc);
    chain.Ingest("a", doc);
    chain.Ingest("b", "please repeat other token");

    const results = chain.Complete("please repeat", { limit: 2 });
    expect(results[0]!.token).toBe("next");
    expect(results[0]!.count).toBe(3);
    expect(results[0]!.source.key).toBe("a");
    expect(results[1]!.token).toBe("other");
    expect(results[1]!.count).toBe(1);
    expect(results[1]!.source.key).toBe("b");
  });

  it("respects limit and minCount", () => {
    const chain = completions.New({ order: 3 });
    chain.Ingest("doc-a", "one two three four five");

    expect(chain.Complete("one two", { limit: 1 })).toHaveLength(1);
    expect(chain.Complete("two three", { minCount: 99 })).toHaveLength(0);
  });

  it("supports clear and size lifecycle", () => {
    const chain = completions.New({ order: 3 });
    chain.Ingest("doc-a", "alpha beta gamma");
    expect(chain.Size()).toBe(1);

    chain.Clear();
    expect(chain.Size()).toBe(0);
    expect(chain.Complete("alpha beta")).toEqual([]);
  });

  it("merges duplicate ingest weights for the same key on a transition", () => {
    const chain = completions.New({ order: 3 });
    const text = "same context next word";

    chain.Ingest("doc-a", text);
    chain.Ingest("doc-a", text);

    const results = chain.Complete("same context", { limit: 1 });
    expect(results[0]!.count).toBe(2);
    expect(results[0]!.token).toBe("next");
    expect(results[0]!.source.key).toBe("doc-a");
  });

  it("defaults to order 3", () => {
    const chain = completions.New();
    chain.Ingest("doc-a", "a b c d");

    expect(chain.Complete("a")).toEqual([]);
    expect(chain.Complete("a b").map((r) => r.token)).toEqual(["c"]);
  });

  it("supports order 1 with empty state key", () => {
    const chain = completions.New({ order: 1 });
    chain.Ingest("doc-a", "only one two");

    expect(chain.Size()).toBe(1);
    expect(chain.Complete("").map((r) => r.token).sort()).toEqual([
      "one",
      "only",
      "two",
    ]);
  });
});

describe("glyph completions result shape", () => {
  it("includes token score count comparison and source", () => {
    const chain = completions.New({ order: 3 });
    chain.Ingest("hello-doc", "hello world next");

    const [result] = chain.Complete("hello world");
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
