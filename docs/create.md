# Creating glyphs

## `create(text, options?)`

Builds a `GlyphRecord` from text.

```ts
import { create } from "glyph-ts";

const record = create("hello world", {
  size: 128,
  vgramSize: 4,
  normalize: true,
});
```

### Options

| Option | Default | Description |
| --- | --- | --- |
| `size` | `128` | Signature length (number of MinHash slots) |
| `vgramSize` | `4` | Word n-gram width for vgrams |
| `normalize` | `true` | Filter tokens and strip unigrams/vgrams |

Larger `size` → more stable similarity estimates, larger payloads.  
Larger `vgramSize` → stricter phrase matching; short texts may produce fewer (or no) vgrams, but unigrams still contribute.

### Return type: `GlyphRecord`

```ts
interface GlyphRecord {
  version: number;   // create pipeline version
  glyph: Glyph;      // Uint32Array & { readonly __glyph: true }
  createdAt: number; // Date.now()
}
```

`GlyphSignature` is the same without `createdAt` (`{ version, glyph }`).

## Feature bag

Each glyph is MinHashed from three feature sets:

1. **tokens** — word tokens after `TextFilter` (when `normalize` is on)
2. **unigrams** — each token after `TextStrip`
3. **vgrams** — overlapping word n-grams of size `vgramSize`, each after `TextStrip`

```ts
bag = [...tokens, ...unigrams, ...vgrams]
glyph = bagMinHash(bag, size)
```

If there aren't enough tokens for a full vgram, the vgram list is empty; tokens/unigrams still fingerprint the text.

## Determinism

Same text + same options → identical glyph bytes. `createdAt` differs per call, but `glyph` does not.

## Tips

- Keep `size` consistent across glyphs you plan to compare (mismatched sizes throw).
- Prefer the same `vgramSize` / `normalize` settings for a corpus.
- For very short phrases, unigrams do the heavy lifting; bumping `vgramSize` alone won't help much.
