# Demo CLI

Local script for comparing two inputs, or searching the docs with Glyph Query.

## Compare mode

```bash
npm run demo -- <input-a> <input-b>
```

Each argument is treated as a **file path if it exists**, otherwise as **literal text**.

```bash
# files
npm run demo -- ./doc-a.txt ./doc-b.txt

# literal text
npm run demo -- "Goodbye moon" "Goodbye sun"

# PowerShell-friendly single arg
npm run demo -- "Goodbye moon|Goodbye sun"

# mix
npm run demo -- ./README.md "some other text"
```

### Output

```text
A: ./doc-a.txt
B: ./doc-b.txt

similarity: 61.72%
matches:    79/128
distance:   49
```

## Search mode (docs index)

Indexes every markdown file under `docs/`, then ranks matches for your query:

```bash
npm run demo -- search "how do groups work"
```

```text
Indexed 9 docs
Query: how do groups work

1. groups.md  100.00%
2. query.md   42.18%
...
```
