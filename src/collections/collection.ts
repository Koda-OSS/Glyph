import type {
  CollectionAggregator,
  Glyph,
  GlyphCollectionInstance,
  GlyphCollectionOptions,
  GlyphGroupInput,
} from "../types";
import { GlyphSizeMismatchError } from "../errors";
import { Create } from "../core/create";
import { isGlyph } from "../core/glyph";
import { normalizeGroup } from "../core/group-input";
import {
  CollectionAggregatorSoftmax,
  rebuildAggregatedGlyph,
} from "./aggregate";

const DEFAULT_GLYPH_SIZE = 128;

function createCollection(
  options: GlyphCollectionOptions = {},
): GlyphCollectionInstance {
  const store: Record<string, Glyph> = {};
  const createOptions = options.create ?? {};
  const aggregator: CollectionAggregator =
    options.aggregator ?? CollectionAggregatorSoftmax;
  const emptySize = createOptions.size ?? DEFAULT_GLYPH_SIZE;

  let aggregated: Glyph = new Uint32Array(emptySize) as Glyph;
  let establishedSize: number | undefined;

  function rebuild() {
    aggregated = rebuildAggregatedGlyph(store, aggregator, emptySize);
  }

  function assertSize(glyph: Glyph) {
    if (establishedSize === undefined) {
      establishedSize = glyph.length;
      return;
    }
    if (glyph.length !== establishedSize) {
      throw new GlyphSizeMismatchError(
        `Collection glyph size mismatch: expected ${establishedSize}, received ${glyph.length}`,
      );
    }
  }

  const collection: GlyphCollectionInstance = {
    get glyph() {
      return aggregated;
    },

    Add(key: string, example: string | Glyph) {
      let glyph: Glyph;

      if (typeof example === "string") {
        glyph = Create(example, createOptions).glyph;
      } else if (isGlyph(example)) {
        glyph = example;
      } else {
        throw new Error("Collection.Add expects a string or Glyph");
      }

      assertSize(glyph);
      store[key] = glyph;
      rebuild();
    },

    AddGroup(group: GlyphGroupInput) {
      if (group === null || typeof group !== "object") {
        throw new Error(
          "Collection.AddGroup expects a Glyph[] or Record<string, Glyph>",
        );
      }

      if (Array.isArray(group) && !group.every(isGlyph)) {
        throw new Error(
          "Collection.AddGroup array values must all be Glyphs",
        );
      }

      if (!Array.isArray(group)) {
        for (const [key, glyph] of Object.entries(group)) {
          if (!isGlyph(glyph)) {
            throw new Error(
              `Collection.AddGroup value for key "${key}" is not a Glyph`,
            );
          }
        }
      }

      const normalized = normalizeGroup(group);
      for (const glyph of Object.values(normalized)) {
        assertSize(glyph);
      }
      for (const [key, glyph] of Object.entries(normalized)) {
        store[key] = glyph;
      }
      rebuild();
    },

    Remove(key: string) {
      delete store[key];
      if (Object.keys(store).length === 0) {
        establishedSize = undefined;
      }
      rebuild();
    },

    Clear() {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
      establishedSize = undefined;
      rebuild();
    },

    Collection() {
      return { ...store };
    },

    Has(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key);
    },

    Count() {
      return Object.keys(store).length;
    },
  };

  return collection;
}

/**
 * Glyph Collections namespace.
 */
export const collections = {
  New: createCollection,
};
