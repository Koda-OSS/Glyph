export { createSpotlightDocument } from "./document";
export { defaultSpotlightChunker } from "./chunker";

import { createSpotlightDocument } from "./document";

/**
 * Glyph Spotlight namespace.
 */
export const spotlight = {
  New: createSpotlightDocument,
};
