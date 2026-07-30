import type {
  Glyph,
  GlyphCollectionInstance,
  GlyphCollectionOptions,
  GlyphIndexInstance,
  GlyphQueryOptions,
  GlyphQueryResult,
} from "../types";
import { Create } from "../core/create";
import { isGlyph } from "../core/utils";
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

    AddGroup(group: Record<string, Glyph>) {
      if (Array.isArray(group)) {
        throw new Error(
          "Collection.AddGroup expects a Record<string, Glyph>, not an array",
        );
      }

      if (typeof group !== "object" || group === null) {
        throw new Error(
          "Collection.AddGroup expects a Record<string, Glyph>",
        );
      }

      for (const [key, glyph] of Object.entries(group)) {
        if (!isGlyph(glyph)) {
          throw new Error(
            `Collection.AddGroup value for key "${key}" is not a Glyph`,
          );
        }
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
