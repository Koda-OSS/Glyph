import type { Glyph, GlyphGroup, GlyphGroupInput, GlyphSignature } from "./core";

export type GlyphIndexMode = "bands" | "direct";

export interface GlyphIndexOptions {
  mode?: GlyphIndexMode;
  bands?: number;
  rows?: number;
  glyphSize?: number;
}

export interface GlyphIndexInstance {
  readonly mode: GlyphIndexMode;
  Get(key: string): Glyph | GlyphGroup | undefined;
  Set(key: string, glyphs?: Glyph | GlyphGroupInput): void;
  Add(key: string, glyphs: Glyph | GlyphGroupInput): void;
  Remove(key: string): void;
  Has(key: string): boolean;
  Clear(): void;
  Size(): number;
  Keys(): IterableIterator<string>;
  Values(): IterableIterator<Glyph | GlyphGroup>;
  Entries(): IterableIterator<[string, Glyph | GlyphGroup]>;
  CandidateKeys(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
  ): IterableIterator<string>;
}
