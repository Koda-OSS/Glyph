import type { GlyphSpotlightChunk } from "../types";

const SENTENCE_END = /[.!?;]/;
const MAX_WORDS = 128;

/**
 * Default spotlight chunker: flush on `.!?;` or at 128 words, whichever comes first.
 */
export function defaultSpotlightChunker(text: string): GlyphSpotlightChunk[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const chunks: GlyphSpotlightChunk[] = [];
  let current = "";
  let wordCount = 0;
  let inWord = false;

  const flush = () => {
    const piece = current.trim();
    if (piece.length > 0) {
      chunks.push(piece);
    }
    current = "";
    wordCount = 0;
    inWord = false;
  };

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i]!;
    current += ch;

    if (/\s/.test(ch)) {
      inWord = false;
    } else if (!inWord) {
      inWord = true;
      wordCount += 1;
    }

    if (SENTENCE_END.test(ch) || wordCount >= MAX_WORDS) {
      flush();
    }
  }

  flush();

  if (chunks.length === 0) {
    return [trimmed];
  }

  return chunks;
}
