# Changelog

All notable changes to **glyph-ts** are documented here.

## 1.0.0

### Breaking changes

- **PascalCase API** — all instance methods and factories use `New()` / PascalCase methods
- **Query wraps an index** — `query(probe, idx, options)` → `query.New(idx).Search(probe, options)`
- Index methods renamed: `Get`, `Set`, `Add`, `Remove`, `Has`, `Clear`, `Size`, `Keys`, `Values`, `Entries`, `CandidateKeys`
- Completions: `Ingest`, `Complete`, `Clear`, `Size`
- Spotlight: `Rank`, `Query`, `Chunks`, `Size`
- Factories: `index.New`, `collections.New`, `completions.New`, `spotlight.New`, `query.New`

See [Migration 0.4 → 1.0](./docs/migration-0.4-to-1.0.md).

### Structure

- Index module moved from `src/core/index/` to `src/index/`
- Package barrel is `src/main.ts` (published entry remains `glyph-ts` → `dist/index.*`)

### Errors

- `GlyphSizeMismatchError`
- `EmptyGroupError`
- `InvalidSerializedGlyphError`

### Other

- Demo CLI: `collection` mode
- Docs updated for 1.0 surface

### Deferred (post-1.0)

- Index disk persistence
- Completion chain persistence

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
