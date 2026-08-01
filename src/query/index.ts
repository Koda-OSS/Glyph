import type {
  Glyph,
  GlyphGroup,
  GlyphGroupInput,
  GlyphIndexInstance,
} from "../types";
import { isGlyph, NormalizeGroup } from "../core/utils";

type IndexValue = Glyph | GlyphGroup;
type IndexInput = Glyph | GlyphGroupInput;

function createIndex(): GlyphIndexInstance {
  const store = new Map<string, IndexValue>();

  return {
    get(key: string) {
      return store.get(key);
    },

    set(key: string, glyphs?: IndexInput) {
      if (glyphs === undefined) {
        store.delete(key);
        return;
      }

      store.set(key, normalizeStoredValue(glyphs));
    },

    add(key: string, glyphs: IndexInput) {
      const incoming = NormalizeGroup(
        isGlyph(glyphs) ? [glyphs] : glyphs,
      );
      const incomingKeys = Object.keys(incoming);
      if (incomingKeys.length === 0) {
        return;
      }

      const existing = store.get(key);
      if (existing === undefined) {
        if (incomingKeys.length === 1) {
          store.set(key, incoming[incomingKeys[0]!]!);
          return;
        }
        store.set(key, incoming);
        return;
      }

      if (isGlyph(existing)) {
        store.set(key, mergeRecordGroup({ "0": existing }, Object.values(incoming)));
        return;
      }

      store.set(key, mergeRecordGroup(existing, Object.values(incoming)));
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

function normalizeStoredValue(value: IndexInput): IndexValue {
  if (isGlyph(value)) {
    return value;
  }

  return NormalizeGroup(value);
}

function mergeRecordGroup(
  existing: GlyphGroup,
  incoming: Glyph[],
): GlyphGroup {
  const next: GlyphGroup = { ...existing };
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
