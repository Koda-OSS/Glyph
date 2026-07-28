import type { Glyph, GlyphGroup, GlyphIndexInstance } from "../types";
import { isGlyph } from "../core/utils";

type IndexValue = Glyph | GlyphGroup;

function createIndex(): GlyphIndexInstance {
  const store = new Map<string, IndexValue>();

  return {
    get(key: string) {
      return store.get(key);
    },

    set(key: string, glyphs?: IndexValue) {
      if (glyphs === undefined) {
        store.delete(key);
        return;
      }

      store.set(key, normalizeStoredValue(glyphs));
    },

    add(key: string, glyphs: IndexValue) {
      const incoming = flattenToGlyphs(glyphs);
      if (incoming.length === 0) {
        return;
      }

      const existing = store.get(key);
      if (existing === undefined) {
        store.set(key, incoming.length === 1 ? incoming[0]! : incoming);
        return;
      }

      if (isGlyph(existing)) {
        store.set(key, [existing, ...incoming]);
        return;
      }

      if (Array.isArray(existing)) {
        store.set(key, [...existing, ...incoming]);
        return;
      }

      store.set(key, mergeRecordGroup(existing, incoming));
    },

    remove(key: string) {
      store.delete(key);
    },

    has(key: string) {
      return store.has(key);
    },

    clear() {
      store.clear();
    },

    size() {
      return store.size;
    },

    keys() {
      return store.keys();
    },

    values() {
      return store.values();
    },

    entries() {
      return store.entries();
    },
  };
}

function normalizeStoredValue(value: IndexValue): IndexValue {
  if (isGlyph(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return [...value];
  }

  return { ...value };
}

function flattenToGlyphs(value: IndexValue): Glyph[] {
  if (isGlyph(value)) {
    return [value];
  }

  if (Array.isArray(value)) {
    return [...value];
  }

  return Object.values(value);
}

function mergeRecordGroup(
  existing: Record<string, Glyph>,
  incoming: Glyph[],
): Record<string, Glyph> {
  const next: Record<string, Glyph> = { ...existing };
  let cursor = 0;

  for (const glyph of incoming) {
    while (Object.prototype.hasOwnProperty.call(next, String(cursor))) {
      cursor += 1;
    }
    next[String(cursor)] = glyph;
    cursor += 1;
  }

  return next;
}

/**
 * Glyph Query index namespace.
 */
export const index = {
  new: createIndex,
};
