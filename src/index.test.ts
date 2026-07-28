import { describe, expect, it } from "vitest";
import {
  CreateTokens,
  CreateUnigrams,
  CreateVGrams,
  TextFilter,
  TextStrip,
  compare,
  create,
  createGroup,
  deserialize,
  index,
  query,
  serialize,
  tokenize,
} from "./index";

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

describe("tokenize", () => {
  it("returns filtered tokens, stripped unigrams, and stripped vgrams", () => {
    const result = tokenize("Alpha, Beta! Gamma Delta", {
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

describe("create", () => {
  it("returns a glyph record with the requested signature size", () => {
    const record = create("the quick brown fox jumps over the lazy dog", {
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
    const a = create("same text every time", options);
    const b = create("same text every time", options);

    expect(Array.from(a.glyph)).toEqual(Array.from(b.glyph));
  });
});

describe("serialize", () => {
  it("round-trips a glyph record back to an equivalent glyph", () => {
    const record = create("serialize me please", { size: 32 });
    const encoded = serialize(record);
    const glyph = deserialize(encoded);

    expect(encoded.startsWith("r1.")).toBe(true);
    expect(Array.from(glyph)).toEqual(Array.from(record.glyph));
    expect(compare(record, glyph).similarity).toBe(1);
  });

  it("round-trips a bare glyph and a signature", () => {
    const record = create("another payload", { size: 16 });
    const signature = { version: record.version, glyph: record.glyph };

    const fromGlyph = deserialize(serialize(record.glyph));
    const fromSignature = deserialize(serialize(signature));

    expect(serialize(record.glyph).startsWith("g1.")).toBe(true);
    expect(serialize(signature).startsWith("s1.")).toBe(true);
    expect(Array.from(fromGlyph)).toEqual(Array.from(record.glyph));
    expect(Array.from(fromSignature)).toEqual(Array.from(record.glyph));
  });

  it("rejects invalid payloads", () => {
    expect(() => deserialize("nope")).toThrow(/invalid/i);
    expect(() => deserialize("g2.abc")).toThrow(/unsupported/i);
  });
});

describe("compare", () => {
  it("reports perfect similarity for identical text", () => {
    const a = create("identical fingerprint input", { size: 64 });
    const b = create("identical fingerprint input", { size: 64 });
    const result = compare(a, b);

    expect(result.similarity).toBe(1);
    expect(result.distance).toBe(0);
    expect(result.matches).toBe(64);
    expect(result.size).toBe(64);
  });

  it("scores shared words in short phrases", () => {
    const a = create("Goodbye moon");
    const b = create("Goodbye sun");
    const result = compare(a, b);

    expect(result.similarity).toBeGreaterThan(0.15);
    expect(result.similarity).toBeLessThan(0.6);
  });

  it("scores similar texts higher than unrelated texts", () => {
    const options = { size: 256, vgramSize: 2, normalize: true } as const;

    const base = create(
      "the quick brown fox jumps over the lazy dog near the river bank",
      options,
    );
    const similar = create(
      "the quick brown fox jumps over a lazy dog near the river bank",
      options,
    );
    const unrelated = create(
      "baking sourdough bread requires flour water salt and patience",
      options,
    );

    const similarScore = compare(base, similar).similarity;
    const unrelatedScore = compare(base, unrelated).similarity;

    expect(similarScore).toBeGreaterThan(unrelatedScore);
    expect(similarScore).toBeGreaterThan(0.5);
    expect(unrelatedScore).toBeLessThan(0.15);
  });

  it("throws when glyph sizes differ", () => {
    const a = create("size mismatch left", { size: 16 });
    const b = create("size mismatch right", { size: 32 });

    expect(() => compare(a, b)).toThrow(/size mismatch/i);
  });
});

describe("group", () => {
  it("createGroup accepts glyphs or strings", () => {
    const fromStrings = createGroup(["Goodbye moon", "hello world"]);
    const fromGlyphs = createGroup([
      create("Goodbye moon").glyph,
      create("hello world").glyph,
    ]);

    expect(Array.isArray(fromStrings)).toBe(true);
    expect(fromStrings).toHaveLength(2);
    expect(fromGlyphs).toHaveLength(2);
    expect(fromStrings[0]).toBeInstanceOf(Uint32Array);
  });

  it("compare uses max aggregate for glyph vs group", () => {
    const query = create("Goodbye moon").glyph;
    const group = createGroup([
      "totally unrelated pasta recipe",
      "Goodbye moon",
      "something else entirely",
    ]);

    const direct = compare(query, create("Goodbye moon").glyph);
    const grouped = compare(query, group);

    expect(grouped.similarity).toBe(direct.similarity);
    expect(grouped.similarity).toBe(1);
  });

  it("compare routes group inputs through group compare", () => {
    const left = createGroup(["alpha beta", "gamma delta"]);
    const right = createGroup(["gamma delta", "unrelated zz"]);

    const result = compare(left, right);
    expect(result.similarity).toBe(1);
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
      const probe = create(randomGarbage(2048)).glyph;
      let queryMs = 0;

      while (queryMs <= 10) {
        idx.set(`doc-${idx.size()}`, create(randomGarbage(4096)).glyph);

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
