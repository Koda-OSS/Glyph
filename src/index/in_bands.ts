import type {
  Glyph,
  GlyphGroupInput,
  GlyphIndexInstance,
  GlyphIndexOptions,
  GlyphSignature,
} from "../types";
import { GlyphSizeMismatchError } from "../errors";
import { isGlyph, isGlyphSignature, resolveGlyph } from "../core/glyph";
import { isGlyphGroup } from "../core/group-input";
import { createDirectIndex } from "./in_direct";
import {
  assertUniformGlyphSize,
  flattenToGlyphs,
  type IndexInput,
} from "./shared";

export type ResolvedBands = {
  bands: number;
  rows: number;
  glyphSize: number;
};

/**
 * Resolve bands/rows against a glyph size.
 * Default for size 128: 64 bands × 2 rows.
 */
export function resolveBandConfig(
  glyphSize: number,
  options: Pick<GlyphIndexOptions, "bands" | "rows"> = {},
): ResolvedBands {
  if (glyphSize < 1) {
    throw new Error(`glyphSize must be >= 1, received ${glyphSize}`);
  }

  let { bands, rows } = options;

  if (bands !== undefined && rows !== undefined) {
    if (bands * rows !== glyphSize) {
      throw new Error(
        `bands * rows must equal glyphSize (${bands} * ${rows} !== ${glyphSize})`,
      );
    }
  } else if (bands !== undefined) {
    if (glyphSize % bands !== 0) {
      throw new Error(
        `glyphSize ${glyphSize} is not divisible by bands ${bands}`,
      );
    }
    rows = glyphSize / bands;
  } else if (rows !== undefined) {
    if (glyphSize % rows !== 0) {
      throw new Error(
        `glyphSize ${glyphSize} is not divisible by rows ${rows}`,
      );
    }
    bands = glyphSize / rows;
  } else if (glyphSize === 128) {
    bands = 64;
    rows = 2;
  } else {
    throw new Error(
      `bands/rows required when glyphSize is ${glyphSize} (defaults only for 128)`,
    );
  }

  if (bands < 1 || rows < 1) {
    throw new Error(`bands and rows must be >= 1 (got ${bands}×${rows})`);
  }

  return { bands, rows, glyphSize };
}

/**
 * Hash one band slice into a bucket key.
 */
export function hashBand(
  glyph: Glyph,
  bandIndex: number,
  rows: number,
): string {
  let hash = 2166136261;
  const start = bandIndex * rows;

  for (let i = 0; i < rows; i++) {
    const value = glyph[start + i]!;
    hash ^= value;
    hash = Math.imul(hash, 16777619);
    hash ^= hash >>> 13;
  }

  return `${bandIndex}:${hash >>> 0}`;
}

function resolveProbeGlyphs(
  probe: Glyph | GlyphSignature | GlyphGroupInput,
): Glyph[] {
  if (isGlyph(probe) || isGlyphSignature(probe)) {
    return [resolveGlyph(probe)];
  }

  if (isGlyphGroup(probe)) {
    return flattenToGlyphs(probe);
  }

  throw new Error("Invalid probe for CandidateKeys");
}

/**
 * LSH banding index. Composes a direct store and maintains band tables.
 */
export function createBandsIndex(
  options: GlyphIndexOptions = {},
): GlyphIndexInstance {
  const direct = createDirectIndex();
  /** bandKey → store keys that collide in that band */
  const tables = new Map<string, Set<string>>();

  let config: ResolvedBands | null =
    options.glyphSize !== undefined
      ? resolveBandConfig(options.glyphSize, options)
      : options.bands !== undefined && options.rows !== undefined
        ? resolveBandConfig(options.bands * options.rows, options)
        : null;

  const bandOptions: Pick<GlyphIndexOptions, "bands" | "rows"> = {};
  if (options.bands !== undefined) {
    bandOptions.bands = options.bands;
  }
  if (options.rows !== undefined) {
    bandOptions.rows = options.rows;
  }

  function ensureConfig(glyphs: Glyph[]): ResolvedBands {
    const size = assertUniformGlyphSize(glyphs, config?.glyphSize);
    if (config === null) {
      config = resolveBandConfig(size, bandOptions);
    } else if (size !== config.glyphSize) {
      throw new GlyphSizeMismatchError(
        `Glyph size mismatch: expected ${config.glyphSize}, received ${size}`,
      );
    }
    return config;
  }

  function indexGlyphs(key: string, glyphs: Glyph[]): void {
    if (glyphs.length === 0) {
      return;
    }
    const { bands, rows } = ensureConfig(glyphs);

    for (const glyph of glyphs) {
      for (let b = 0; b < bands; b++) {
        const bucketKey = hashBand(glyph, b, rows);
        let bucket = tables.get(bucketKey);
        if (bucket === undefined) {
          bucket = new Set();
          tables.set(bucketKey, bucket);
        }
        bucket.add(key);
      }
    }
  }

  function unindexGlyphs(key: string, glyphs: Glyph[]): void {
    if (glyphs.length === 0 || config === null) {
      return;
    }
    const { bands, rows } = config;

    for (const glyph of glyphs) {
      for (let b = 0; b < bands; b++) {
        const bucketKey = hashBand(glyph, b, rows);
        const bucket = tables.get(bucketKey);
        if (bucket === undefined) {
          continue;
        }
        bucket.delete(key);
        if (bucket.size === 0) {
          tables.delete(bucketKey);
        }
      }
    }
  }

  return {
    mode: "bands",

    Get(key: string) {
      return direct.Get(key);
    },

    Set(key: string, glyphs?: IndexInput) {
      const previous = direct.Get(key);
      if (previous !== undefined) {
        unindexGlyphs(key, flattenToGlyphs(previous));
      }

      if (glyphs === undefined) {
        direct.Set(key);
        return;
      }

      const stored = flattenToGlyphs(glyphs);
      ensureConfig(stored);
      direct.Set(key, glyphs);
      indexGlyphs(key, flattenToGlyphs(direct.Get(key)!));
    },

    Add(key: string, glyphs: IndexInput) {
      const incoming = flattenToGlyphs(glyphs);
      if (incoming.length === 0) {
        return;
      }

      ensureConfig(incoming);

      const previous = direct.Get(key);
      if (previous !== undefined) {
        unindexGlyphs(key, flattenToGlyphs(previous));
      }

      direct.Add(key, glyphs);

      const stored = direct.Get(key);
      if (stored !== undefined) {
        indexGlyphs(key, flattenToGlyphs(stored));
      }
    },

    Remove(key: string) {
      const previous = direct.Get(key);
      if (previous !== undefined) {
        unindexGlyphs(key, flattenToGlyphs(previous));
      }
      direct.Remove(key);
    },

    Has(key: string) {
      return direct.Has(key);
    },

    Clear() {
      direct.Clear();
      tables.clear();
      if (options.glyphSize === undefined) {
        config = null;
      }
    },

    Size() {
      return direct.Size();
    },

    Keys() {
      return direct.Keys();
    },

    Values() {
      return direct.Values();
    },

    Entries() {
      return direct.Entries();
    },

    *CandidateKeys(
      probe: Glyph | GlyphSignature | GlyphGroupInput,
    ): IterableIterator<string> {
      if (config === null || direct.Size() === 0) {
        return;
      }

      const probeGlyphs = resolveProbeGlyphs(probe);
      assertUniformGlyphSize(probeGlyphs, config.glyphSize);

      const { bands, rows } = config;
      const seen = new Set<string>();

      for (const glyph of probeGlyphs) {
        for (let b = 0; b < bands; b++) {
          const bucket = tables.get(hashBand(glyph, b, rows));
          if (bucket === undefined) {
            continue;
          }
          for (const key of bucket) {
            if (!seen.has(key)) {
              seen.add(key);
              yield key;
            }
          }
        }
      }
    },
  };
}
