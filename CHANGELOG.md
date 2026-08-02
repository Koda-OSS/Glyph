# Changelog

All notable changes to **glyph-ts** are documented here.

## 0.4.4

### Internal

- Split `src/types.ts` into `src/types/` by domain (`core`, `glyph-index`, `query`, `collections`, `completions`, `spotlight`)
- Split `src/core/utils.ts` into `text.ts`, `glyph.ts`, and `group-input.ts`
- Renamed internal helpers to camelCase (`normalizeGroup`, `groupEntries`, `toMatchedKey`, `isGlyphSignature`)
- No public export changes

## 0.4.3

### Documentation

- Slim root `README.md` — full index lives in `docs/README.md`
- Real `npm install glyph-ts` in getting started
- Added [Your first collection](./docs/your-first-collection.md)
- Removed stale `docs/collections/query.md` and root `other.md`

## 0.4.1

### Collections

- Collections are a **glyph aggregation** primitive — no `Query` / `CollectionQuery`
- `collection.glyph` — slot-wise pre-aggregated fingerprint, rebuilt on mutation
- `Collection()` replaces `Examples()`
- `aggregator` option with built-in `CollectionAggregator*` (default: Softmax)
- Empty collection returns a zero-filled glyph

### Breaking changes

- `GroupAggregate*` → `GroupResultAggregator*`
- Removed `CollectionQuery` and `collection.Query()`
- `GlyphCollectionOptions.aggregate` → `aggregator`

### Other

- Spotlight module (`spotlight.new`, rank, query)
- License aligned to MPL-2.0 (`LICENCE` + `package.json`)

## 0.3.0

- LSH banding index (default `64×2` for size 128)
- Index moved to `src/core/index/`
- `query()` uses `candidateKeys` for band-aware search

## Earlier

See git history for pre-0.3 releases.
