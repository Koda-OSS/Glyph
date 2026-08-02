import type {
  Glyph,
  GlyphGroupInput,
  GlyphIndexInstance,
  GlyphSignature,
} from "../types";
import { isGlyph } from "../core/glyph";
import { normalizeGroup } from "../core/group-input";
import {
  type IndexInput,
  type IndexValue,
  mergeRecordGroup,
  normalizeStoredValue,
} from "./shared";

/**
 * Exact Map-backed index. CandidateKeys yields every stored key.
 */
export function createDirectIndex(): GlyphIndexInstance {
  const store = new Map<string, IndexValue>();

  return {
    mode: "direct",

    Get(key: string) {
      return store.get(key);
    },

    Set(key: string, glyphs?: IndexInput) {
      if (glyphs === undefined) {
        store.delete(key);
        return;
      }

      store.set(key, normalizeStoredValue(glyphs));
    },

    Add(key: string, glyphs: IndexInput) {
      const incoming = normalizeGroup(isGlyph(glyphs) ? [glyphs] : glyphs);
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
        store.set(
          key,
          mergeRecordGroup({ "0": existing }, Object.values(incoming)),
        );
        return;
      }

      store.set(key, mergeRecordGroup(existing, Object.values(incoming)));
    },

    Remove(key: string) {
      store.delete(key);
    },

    Has(key: string) {
      return store.has(key);
    },

    Clear() {
      store.clear();
    },

    Size() {
      return store.size;
    },

    Keys() {
      return store.keys();
    },

    Values() {
      return store.values();
    },

    Entries() {
      return store.entries();
    },

    *CandidateKeys(
      _probe: Glyph | GlyphSignature | GlyphGroupInput,
    ): IterableIterator<string> {
      yield* store.keys();
    },
  };
}
