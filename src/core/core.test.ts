import { describe, expect, it } from "vitest";
import {
  Compare,
  Create,
  CreateGroup,
  CreateTokens,
  CreateUnigrams,
  CreateVGrams,
  Deserialize,
  Serialize,
  TextFilter,
  TextStrip,
  Tokenize,
} from "../index";

describe("TextFilter", () => {
  it("lowercases and removes disallowed characters from tokens", () => {
    expect(TextFilter("Hello,")).toBe("hello,");
    expect(TextFilter("World!")).toBe("world!");
    expect(TextFilter("A-B_C")).toBe("a-b_c");
    expect(TextFilter("Version2")).toBe("version2");
  });
});

describe("TextStrip", () => {
  it("lowercases and strips spaces, punctuation, and special characters", () => {
    expect(TextStrip("Hello, World!")).toBe("helloworld");
    expect(TextStrip("foo-bar baz 123")).toBe("foobarbaz123");
    expect(TextStrip("A B C")).toBe("abc");
  });

  it("keeps letters and numbers only", () => {
    expect(TextStrip("Price: $12.50!!")).toBe("price1250");
  });
});

describe("CreateTokens", () => {
  it("filters each token when normalize is on", () => {
    expect(CreateTokens("Hello, WORLD! v2", true)).toEqual([
      "hello,",
      "world!",
      "v2",
    ]);
  });

  it("returns an empty list for blank input", () => {
    expect(CreateTokens("   ", true)).toEqual([]);
  });
});

describe("CreateUnigrams", () => {
  it("returns stripped unigrams for each token", () => {
    expect(CreateUnigrams("Hello, WORLD!", true)).toEqual(["hello", "world"]);
  });
});

describe("CreateVGrams", () => {
  it("strips each vgram when normalize is on", () => {
    expect(CreateVGrams("one two three four five", 3, true)).toEqual([
      "onetwothree",
      "twothreefour",
      "threefourfive",
    ]);
  });

  it("returns no vgrams when text is shorter than vgramSize", () => {
    expect(CreateVGrams("one two", 4, true)).toEqual([]);
  });
});

describe("Tokenize", () => {
  it("returns filtered tokens, stripped unigrams, and stripped vgrams", () => {
    const result = Tokenize("Alpha, Beta! Gamma Delta", {
      vgramSize: 2,
      normalize: true,
    });

    expect(result.tokens).toEqual(["alpha,", "beta!", "gamma", "delta"]);
    expect(result.unigrams).toEqual(["alpha", "beta", "gamma", "delta"]);
    expect(result.vgrams).toEqual([
      "alphabeta",
      "betagamma",
      "gammadelta",
    ]);
  });
});

describe("Create", () => {
  it("returns a glyph record with the requested signature size", () => {
    const record = Create("the quick brown fox jumps over the lazy dog", {
      size: 32,
      vgramSize: 3,
    });

    expect(record.version).toBe(1);
    expect(record.glyph).toBeInstanceOf(Uint32Array);
    expect(record.glyph.length).toBe(32);
    expect(record.createdAt).toBeTypeOf("number");
  });

  it("is deterministic for the same input and options", () => {
    const options = { size: 64, vgramSize: 2, normalize: true } as const;
    const a = Create("same text every time", options);
    const b = Create("same text every time", options);

    expect(Array.from(a.glyph)).toEqual(Array.from(b.glyph));
  });
});

describe("Serialize", () => {
  it("round-trips a glyph record back to an equivalent glyph", () => {
    const record = Create("serialize me please", { size: 32 });
    const encoded = Serialize(record);
    const glyph = Deserialize(encoded);

    expect(encoded.startsWith("r1.")).toBe(true);
    expect(Array.from(glyph)).toEqual(Array.from(record.glyph));
    expect(Compare(record, glyph).similarity).toBe(1);
  });

  it("round-trips a bare glyph and a signature", () => {
    const record = Create("another payload", { size: 16 });
    const signature = { version: record.version, glyph: record.glyph };

    const fromGlyph = Deserialize(Serialize(record.glyph));
    const fromSignature = Deserialize(Serialize(signature));

    expect(Serialize(record.glyph).startsWith("g1.")).toBe(true);
    expect(Serialize(signature).startsWith("s1.")).toBe(true);
    expect(Array.from(fromGlyph)).toEqual(Array.from(record.glyph));
    expect(Array.from(fromSignature)).toEqual(Array.from(record.glyph));
  });

  it("rejects invalid payloads", () => {
    expect(() => Deserialize("nope")).toThrow(/invalid/i);
    expect(() => Deserialize("g2.abc")).toThrow(/unsupported/i);
  });
});

describe("Compare", () => {
  it("reports perfect similarity for identical text", () => {
    const a = Create("identical fingerprint input", { size: 64 });
    const b = Create("identical fingerprint input", { size: 64 });
    const result = Compare(a, b);

    expect(result.similarity).toBe(1);
    expect(result.distance).toBe(0);
    expect(result.matches).toBe(64);
    expect(result.size).toBe(64);
  });

  it("scores shared words in short phrases", () => {
    const a = Create("Goodbye moon");
    const b = Create("Goodbye sun");
    const result = Compare(a, b);

    expect(result.similarity).toBeGreaterThan(0.15);
    expect(result.similarity).toBeLessThan(0.6);
  });

  it("scores similar texts higher than unrelated texts", () => {
    const options = { size: 256, vgramSize: 2, normalize: true } as const;

    const base = Create(
      "the quick brown fox jumps over the lazy dog near the river bank",
      options,
    );
    const similar = Create(
      "the quick brown fox jumps over a lazy dog near the river bank",
      options,
    );
    const unrelated = Create(
      "baking sourdough bread requires flour water salt and patience",
      options,
    );

    const similarScore = Compare(base, similar).similarity;
    const unrelatedScore = Compare(base, unrelated).similarity;

    expect(similarScore).toBeGreaterThan(unrelatedScore);
    expect(similarScore).toBeGreaterThan(0.5);
    expect(unrelatedScore).toBeLessThan(0.15);
  });

  it("throws when glyph sizes differ", () => {
    const a = Create("size mismatch left", { size: 16 });
    const b = Create("size mismatch right", { size: 32 });

    expect(() => Compare(a, b)).toThrow(/size mismatch/i);
  });
});

describe("CreateGroup", () => {
  it("accepts glyphs or strings", () => {
    const fromStrings = CreateGroup(["Goodbye moon", "hello world"]);
    const fromGlyphs = CreateGroup([
      Create("Goodbye moon").glyph,
      Create("hello world").glyph,
    ]);

    expect(Array.isArray(fromStrings)).toBe(true);
    expect(fromStrings).toHaveLength(2);
    expect(fromGlyphs).toHaveLength(2);
    expect(fromStrings[0]).toBeInstanceOf(Uint32Array);
  });

  it("Compare uses max aggregate for glyph vs group", () => {
    const probe = Create("Goodbye moon").glyph;
    const group = CreateGroup([
      "totally unrelated pasta recipe",
      "Goodbye moon",
      "something else entirely",
    ]);

    const direct = Compare(probe, Create("Goodbye moon").glyph);
    const grouped = Compare(probe, group);

    expect(grouped.similarity).toBe(direct.similarity);
    expect(grouped.similarity).toBe(1);
  });

  it("Compare routes group inputs through CompareGroups", () => {
    const left = CreateGroup(["alpha beta", "gamma delta"]);
    const right = CreateGroup(["gamma delta", "unrelated zz"]);

    const result = Compare(left, right);
    expect(result.similarity).toBe(1);
  });
});
