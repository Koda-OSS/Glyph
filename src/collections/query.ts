import type {
  GlyphCollectionInstance,
  GlyphIndexInstance,
  GlyphQueryOptions,
  GlyphQueryResult,
} from "../types";
import { query } from "../query/query";

/**
 * Rank index entries against a collection's examples (group probe).
 */
export function CollectionQuery(
  collection: GlyphCollectionInstance,
  index: GlyphIndexInstance,
  options: GlyphQueryOptions = {},
): GlyphQueryResult[] {
  const examples = collection.Examples();

  if (Object.keys(examples).length === 0) {
    throw new Error("Cannot query an empty collection");
  }

  return query(examples, index, options);
}
