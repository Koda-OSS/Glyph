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
  get(key: string): Glyph | GlyphGroup | undefined;
  set(key: string, glyphs?: Glyph | GlyphGroupInput): void;
  add(key: string, glyphs: Glyph | GlyphGroupInput): void;
  remove(key: string): void;
  has(key: string): boolean;
  clear(): void;
  size(): number;
  keys(): IterableIterator<string>;
  values(): IterableIterator<Glyph | GlyphGroup>;
  entries(): IterableIterator<[string, Glyph | GlyphGroup]>;
  candidateKeys(
    probe: Glyph | GlyphSignature | GlyphGroupInput,
  ): IterableIterator<string>;
}
