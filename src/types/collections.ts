import type {
  Glyph,
  GlyphCreateOptions,
  GlyphGroup,
  GlyphGroupInput,
} from "./core";

export type CollectionAggregatorContext = {
  collection: GlyphGroup;
  index: number;
};

export type CollectionAggregator = (
  values: number[],
  context?: CollectionAggregatorContext,
) => number;

export interface GlyphCollectionOptions {
  create?: GlyphCreateOptions;
  aggregator?: CollectionAggregator;
}

export interface GlyphCollectionInstance {
  readonly glyph: Glyph;

  Add(key: string, example: string | Glyph): void;
  AddGroup(group: GlyphGroupInput): void;

  Remove(key: string): void;
  Clear(): void;

  Collection(): GlyphGroup;

  Has(key: string): boolean;
  Count(): number;
}
