import type {
  CompletionChainInstance,
  Glyph,
  GlyphComparisonResult,
  GlyphCompletionChainOptions,
  GlyphCompletionOptions,
  GlyphCompletionResult,
  GlyphToken,
} from "../types";
import { CompareGlyphs } from "../core/compare";
import { Create } from "../core/create";
import { CreateUnigrams } from "../core/tokenize";

type StateKey = string;

type GlyphSource = {
  key: string;
  glyph: Glyph;
  weight: number;
};

type TransitionEntry = {
  count: number;
  sources: GlyphSource[];
};

const DefaultChainOptions = {
  order: 3,
} as const;

const DefaultCompleteOptions = {
  limit: 5,
  minCount: 1,
} as const;

function createChain(
  options: GlyphCompletionChainOptions = {},
): CompletionChainInstance {
  const order = options.order ?? DefaultChainOptions.order;
  const createOptions = options.create ?? {};
  const normalize = createOptions.normalize ?? true;

  if (order < 1) {
    throw new Error(`order must be >= 1, received ${order}`);
  }

  const states = new Map<StateKey, Map<GlyphToken, TransitionEntry>>();

  return {
    Ingest(key: string, text: string) {
      // Stripped unigrams only — no punctuation/symbols in chain tokens.
      const tokens = CreateUnigrams(text, normalize);
      if (tokens.length === 0) {
        return;
      }

      const glyph = Create(text, createOptions).glyph;

      for (let i = order - 1; i < tokens.length; i++) {
        const nextToken = tokens[i]!;
        const stateKey = tokens.slice(i - (order - 1), i).join(" ");
        addTransition(states, stateKey, nextToken, key, glyph);
      }
    },

    Complete(
      prefix: string,
      completeOptions: GlyphCompletionOptions = {},
    ): GlyphCompletionResult[] {
      const limit = completeOptions.limit ?? DefaultCompleteOptions.limit;
      const minCount =
        completeOptions.minCount ?? DefaultCompleteOptions.minCount;

      const tokens = CreateUnigrams(prefix, normalize);
      if (tokens.length < order - 1) {
        return [];
      }

      const stateKey = tokens.slice(tokens.length - (order - 1)).join(" ");
      const transitions = states.get(stateKey);
      if (transitions === undefined) {
        return [];
      }

      const probe = Create(prefix, createOptions).glyph;
      const results: GlyphCompletionResult[] = [];

      for (const [token, entry] of transitions) {
        if (entry.count < minCount) {
          continue;
        }

        const scored = scoreTransition(probe, entry);
        results.push({
          token,
          score: scored.score,
          count: entry.count,
          comparison: scored.comparison,
          source: {
            key: scored.source.key,
            glyph: scored.source.glyph,
          },
        });
      }

      results.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.token.localeCompare(b.token);
      });

      return results.slice(0, limit);
    },

    Clear() {
      states.clear();
    },

    Size() {
      return states.size;
    },
  };
}

function addTransition(
  states: Map<StateKey, Map<GlyphToken, TransitionEntry>>,
  stateKey: StateKey,
  nextToken: GlyphToken,
  key: string,
  glyph: Glyph,
): void {
  let transitions = states.get(stateKey);
  if (transitions === undefined) {
    transitions = new Map();
    states.set(stateKey, transitions);
  }

  let entry = transitions.get(nextToken);
  if (entry === undefined) {
    entry = { count: 0, sources: [] };
    transitions.set(nextToken, entry);
  }

  entry.count += 1;
  mergeSource(entry.sources, key, glyph);
}

function mergeSource(
  sources: GlyphSource[],
  key: string,
  glyph: Glyph,
): void {
  for (const source of sources) {
    if (source.key === key) {
      source.glyph = glyph;
      source.weight += 1;
      return;
    }
  }

  sources.push({ key, glyph, weight: 1 });
}

function scoreTransition(
  probe: Glyph,
  entry: TransitionEntry,
): {
  score: number;
  comparison: GlyphComparisonResult;
  source: GlyphSource;
} {
  let weightedSum = 0;
  let totalWeight = 0;
  let bestSource = entry.sources[0]!;
  let bestComparison = CompareGlyphs(probe, bestSource.glyph);

  for (const source of entry.sources) {
    const comparison = CompareGlyphs(probe, source.glyph);
    weightedSum += comparison.similarity * source.weight;
    totalWeight += source.weight;

    // Primary source = highest glyph similarity to the probe.
    if (
      comparison.similarity > bestComparison.similarity ||
      (comparison.similarity === bestComparison.similarity &&
        source.weight > bestSource.weight)
    ) {
      bestSource = source;
      bestComparison = comparison;
    }
  }

  return {
    score: totalWeight === 0 ? 0 : weightedSum / totalWeight,
    comparison: bestComparison,
    source: bestSource,
  };
}

/**
 * Glyph Completions namespace.
 */
export const completions = {
  New: createChain,
};
