import type {
  Glyph,
  GlyphGroupInput,
  GlyphSignature,
  GlyphSpotlightCompiledChunk,
  GlyphSpotlightDocumentInstance,
  GlyphSpotlightOptions,
  GlyphSpotlightQueryOptions,
  GlyphSpotlightRankOptions,
  GlyphSpotlightResult,
} from "../types";
import { Create } from "../core/create";
import { defaultSpotlightChunker } from "./chunker";
import { formatOutput, scoreChunks } from "./rank";

/**
 * Compile content into fingerprinted chunks and return a spotlight document.
 */
export function createSpotlightDocument(
  content: string,
  options: GlyphSpotlightOptions = {},
): GlyphSpotlightDocumentInstance {
  const chunker = options.chunker ?? defaultSpotlightChunker;
  const createOpts = {
    ...options.create,
    ...(options.normalize !== undefined
      ? { normalize: options.normalize }
      : {}),
  };

  const compiled: GlyphSpotlightCompiledChunk[] = chunker(content).map(
    (text) => ({
      text,
      glyph: Create(text, createOpts).glyph,
      length: text.length,
    }),
  );

  function Rank(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
    rankOptions?: GlyphSpotlightRankOptions & { textOutput?: false },
  ): GlyphSpotlightResult[];
  function Rank(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
    rankOptions: GlyphSpotlightRankOptions & { textOutput: true },
  ): string[];
  function Rank(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
    rankOptions: GlyphSpotlightRankOptions = {},
  ): GlyphSpotlightResult[] | string[] {
    const scored = scoreChunks(probe, compiled, rankOptions);
    return formatOutput(scored, rankOptions.textOutput);
  }

  function Query(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
    queryOptions?: GlyphSpotlightQueryOptions & { textOutput?: false },
  ): GlyphSpotlightResult[];
  function Query(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
    queryOptions: GlyphSpotlightQueryOptions & { textOutput: true },
  ): string[];
  function Query(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
    queryOptions: GlyphSpotlightQueryOptions = {},
  ): GlyphSpotlightResult[] | string[] {
    const threshold = queryOptions.threshold ?? 0;
    let scored = scoreChunks(probe, compiled, queryOptions).filter(
      (result) => result.score >= threshold,
    );

    if (queryOptions.limit !== undefined) {
      scored = scored.slice(0, queryOptions.limit);
    }

    return formatOutput(scored, queryOptions.textOutput);
  }

  return {
    Rank,
    Query,
    Chunks() {
      return compiled.map((chunk) => ({ ...chunk }));
    },
    Size() {
      return compiled.length;
    },
  };
}
