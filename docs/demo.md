![Glyph Ribbon](/docs/media/RibbonGlyph.png)

# Demo CLI

> Try compare, search, complete, spotlight, and collection modes against this repo without writing app code.

The demo script is `demo.ts`. Run it with:

```bash
npm run demo -- <args>
```

## Modes

| Mode | Command | What it does |
| --- | --- | --- |
| Compare | `npm run demo -- <a> <b>` | Fingerprint two inputs and print similarity |
| Search | `npm run demo -- search "<query>"` | Index `docs/**/*.md`, rank matches |
| Complete | `npm run demo -- complete "<prefix>"` | Ingest docs, suggest next words |
| Spotlight | `npm run demo -- spotlight <file-or-text> "<probe>"` | Chunk one document, rank snippets |
| Collection | `npm run demo -- collection "example a" "example b" ...` | Aggregate examples into one glyph |

## Compare

Each argument is a **file path** if that file exists, otherwise **literal text**.

```bash
npm run demo -- ./doc-a.txt ./doc-b.txt
npm run demo -- "the quick brown fox" "the quick brown dog"
npm run demo -- "left text|right text"
```

Output:

```text
A: ...
B: ...

similarity: 42.19%
matches:    54/128
distance:   74
```

Uses `Create()` + `Compare()` with `size: 128`.

## Search

Indexes every markdown file under `docs/`, then runs `query.New(idx).Search()` with `limit: 5`, `threshold: 0`, and `normalize: true`.

```bash
npm run demo -- search "how do groups work"
```

Output includes index time, query time, and ranked keys (paths relative to `docs/`).

## Complete

Ingests the same `docs/**/*.md` corpus into a completion chain, then runs `Complete()` with `limit: 5` and `minCount: 1`.

```bash
npm run demo -- complete "how do groups"
```

Output includes ingest time, complete time, and ranked tokens with score, count, and `source.key`.

## Spotlight

Chunks one document with `spotlight.New()`, then ranks snippets with `document.Query()` (`limit: 5`, `threshold: 0`).

The first argument after `spotlight` is a **file path** if it exists, otherwise **literal text**. Remaining args form the probe string.

```bash
npm run demo -- spotlight ./docs/core/index.md "LSH banding"
npm run demo -- spotlight "Goodbye moon under quiet stars. Pasta recipe. Goodbye moon again." "Goodbye moon"
```

Output includes compile time, chunk count, rank time, and top snippets with scores.

## Collection

Builds a Softmax-aggregated collection from one or more example strings using `collections.New()` and `Add()`.

```bash
npm run demo -- collection "goodbye moon" "goodbye sun" "stars shine"
```

Output includes collection count, aggregated glyph size, first eight slots, and stored keys.

## Tips

| Tip | Detail |
| --- | --- |
| PowerShell | Prefer `search` / `complete` / `spotlight` / `collection` (not `--search`) so flags are not eaten |
| Quoted prefixes | Wrap multi-word queries and prefixes in quotes |
| Corpus | Search and complete use live docs — edit docs, re-run, see new results |

## Related

<!-- glyph-related:start -->
- [Building an index](./building-an-index.md)
- [Spotlight rank](./spotlight/rank.md)
- [Your first completion](./your-first-completion.md)
- [Your first spotlight](./your-first-spotlight.md)
- [Complete a prefix](./completions/complete.md)
<!-- glyph-related:end -->

_Related links ranked by [Glyph](https://github.com/Koda-OSS/Glyph)._
