import type { GlyphIndexInstance, GlyphIndexOptions } from "../../types";
import { createBandsIndex } from "./in_bands";
import { createDirectIndex } from "./in_direct";

/**
 * Create a glyph index. Default mode is LSH banding.
 */
export function createIndex(
  options: GlyphIndexOptions = {},
): GlyphIndexInstance {
  const mode = options.mode ?? "bands";

  if (mode === "direct") {
    return createDirectIndex();
  }

  return createBandsIndex(options);
}

/**
 * Glyph index namespace.
 */
export const index = {
  new: createIndex,
};
