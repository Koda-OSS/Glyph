![Glyph Ribbon](/docs/media/RibbonGlyph.png)

# Demo CLI

> Try compare, search, and complete against this repo without writing app code.

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

Indexes every markdown file under `docs/`, then runs `query()` with `limit: 5`, `threshold: 0`, and `normalize: true`.

```bash
npm run demo -- search "how do groups work"
```

Output includes index time, query time, and ranked keys (paths relative to `docs/`).

## Complete

Ingests the same `docs/**/*.md` corpus into a completion chain, then runs `complete()` with `limit: 5` and `minCount: 1`.

```bash
npm run demo -- complete "how do groups"
```

Output includes ingest time, complete time, and ranked tokens with score, count, and `source.key`.

## Tips

| Tip | Detail |
| --- | --- |
| PowerShell | Prefer `search` / `complete` (not `--search`) so flags are not eaten |
| Quoted prefixes | Wrap multi-word queries and prefixes in quotes |
| Corpus | Both search and complete use live docs — edit docs, re-run, see new results |

## See also

- [Getting started](./getting-started.md)
- [Building an index](./building-an-index.md)
- [Your first completion](./your-first-completion.md)
- [Query](./query/query.md)
- [Complete](./completions/complete.md)
