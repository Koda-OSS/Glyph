import type {
  Glyph,
  GlyphCreateOptions,
  GlyphRecord,
  GlyphToken,
  GlyphUnigram,
  GlyphVGram,
} from "../types";
import {
  CreateTokens,
  unigramsFromTokens,
  vgramsFromTokens,
} from "./tokenize";

const GLYPHCREATE_VERSION = 1;

const DefaultCreateOptions = {
  size: 128,
  vgramSize: 4,
  normalize: true,
} as const;

export function Create(
  text: string,
  options: GlyphCreateOptions = {},
): GlyphRecord {
  const size = options.size ?? DefaultCreateOptions.size;
  const vgramSize = options.vgramSize ?? DefaultCreateOptions.vgramSize;
  const normalize = options.normalize ?? DefaultCreateOptions.normalize;

  if (size < 1) {
    throw new Error(`size must be >= 1, received ${size}`);
  }

  if (vgramSize < 1) {
    throw new Error(`vgramSize must be >= 1, received ${vgramSize}`);
  }

  const glyph = createGlyph(text, size, vgramSize, normalize);

  return {
    version: GLYPHCREATE_VERSION,
    glyph,
    createdAt: Date.now(),
  };
}

function createGlyph(
  text: string,
  size: number,
  vgramSize: number,
  normalize: boolean,
): Glyph {
  const tokens = CreateTokens(text, normalize);
  const unigrams = unigramsFromTokens(tokens, normalize);
  const vgrams = vgramsFromTokens(tokens, vgramSize, normalize);

  return bagMinHash([...tokens, ...unigrams, ...vgrams], size);
}

function asGlyph(signature: Uint32Array): Glyph {
  return signature as Glyph;
}

function hashValue(value: string): number {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mix(seed: number, index: number): number {
  let x = seed ^ Math.imul(index + 1, 0x9e3779b9);

  x ^= x >>> 16;
  x = Math.imul(x, 0x85ebca6b);

  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);

  x ^= x >>> 16;

  return x >>> 0;
}

// Originally we intended to implement bagminhash, but we opted instead for traditional set minhash.
// TODO: Rename function
function bagMinHash(
  items: (GlyphToken | GlyphUnigram | GlyphVGram)[],
  size: number,
): Glyph {
  const signature = new Uint32Array(size);
  signature.fill(0xffffffff);

  for (const item of items) {
    const seed = hashValue(item);

    for (let i = 0; i < size; i++) {
      const hash = mix(seed, i);

      if (hash < signature[i]!) {
        signature[i] = hash;
      }
    }
  }

  return asGlyph(signature);
}
