import type {
  Glyph,
  GlyphGroupInput,
  GlyphIndexInstance,
  GlyphSignature,
} from "../../types";
import { isGlyph, NormalizeGroup } from "../utils";
import {
  type IndexInput,
  type IndexValue,
  mergeRecordGroup,
  normalizeStoredValue,
} from "./shared";

/**
 * Exact Map-backed index. candidateKeys yields every stored key.
 */
export function createDirectIndex(): GlyphIndexInstance {
  const store = new Map<string, IndexValue>();

  return {
    mode: "direct",

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
      const incoming = NormalizeGroup(isGlyph(glyphs) ? [glyphs] : glyphs);
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

    *candidateKeys(
      _probe: Glyph | GlyphSignature | GlyphGroupInput,
    ): IterableIterator<string> {
      yield* store.keys();
    },
  };
}
