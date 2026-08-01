import type {
  Glyph,
  GlyphCollectionInstance,
  GlyphCollectionOptions,
  GlyphGroupInput,
  GlyphIndexInstance,
  GlyphQueryOptions,
  GlyphQueryResult,
} from "../types";
import { Create } from "../core/create";
import { isGlyph, NormalizeGroup } from "../core/utils";
import { CollectionQuery } from "./query";

function createCollection(
  options: GlyphCollectionOptions = {},
): GlyphCollectionInstance {
  const store: Record<string, Glyph> = {};
  const createOptions = options.create ?? {};

  const collection: GlyphCollectionInstance = {
    Add(key: string, example: string | Glyph) {
      if (typeof example === "string") {
        store[key] = Create(example, createOptions).glyph;
        return;
      }

      if (!isGlyph(example)) {
        throw new Error("Collection.Add expects a string or Glyph");
      }

      store[key] = example;
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

      const normalized = NormalizeGroup(group);
      for (const [key, glyph] of Object.entries(normalized)) {
        store[key] = glyph;
      }
    },

    Remove(key: string) {
      delete store[key];
    },

    Clear() {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    },

    Examples() {
      return { ...store };
    },

    Has(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key);
    },

    Count() {
      return Object.keys(store).length;
    },

    Query(
      index: GlyphIndexInstance,
      queryOptions: GlyphQueryOptions = {},
    ): GlyphQueryResult[] {
      return CollectionQuery(collection, index, queryOptions);
    },
  };

  return collection;
}

/**
 * Glyph Collections namespace.
 */
export const collections = {
  new: createCollection,
};
