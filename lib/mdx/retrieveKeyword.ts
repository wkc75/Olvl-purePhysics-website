import type { Chunk } from "./chunkMdx";

/**
 * retrieveTopChunksKeyword (MVP Retriever)
 *
 * Mental model:
 * - Split the user's question into keywords
 * - Give each chunk a score based on:
 *    (1) how many keywords appear in it
 *    (2) how frequent they appear
 *    (3) small bonus for phrase match
 *
 * This is NOT "semantic search" yet, but it's:
 * - fast
 * - easy to debug
 * - good enough for a 2-day MVP
 */
export function retrieveTopChunksKeyword(
  query: string,
  chunks: Chunk[],
  topK: number = 6
): Chunk[] {
  const q = normalize(query);
  const tokens = tokenize(q);

  // If the user wrote nothing meaningful, return empty.
  if (tokens.length === 0) return [];

  const scored = chunks.map((c) => {
    const text = normalize(c.text);

    // Token match score
    let score = 0;
    for (const t of tokens) {
      // count occurrences (cheap frequency signal)
      score += countOccurrences(text, t) * tokenWeight(t);
    }

    // Phrase bonus (encourage exact phrase hits)
    if (q.length >= 12 && text.includes(q)) score += 8;

    return { chunk: c, score };
  });

  // Sort by score desc, keep only positive-scoring chunks
  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((s) => s.score > 0)
    .slice(0, topK)
    .map((s) => s.chunk);
}

/* ---------------- Helpers ---------------- */

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s.+\-/%°]/g, " ") // keep common physics symbols
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string) {
  // Remove very common stopwords so retrieval is less noisy.
  const STOP = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "this",
    "that",
    "these",
    "those",
    "it",
    "as",
    "by",
    "from",
    "at",
    "into",
    "over",
    "under",
    "between",
    "when",
    "what",
    "why",
    "how",
    "explain",
    "define",
    "find",
    "calculate",
    "show",
  ]);

  return s
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .filter((t) => !STOP.has(t));
}

function countOccurrences(haystack: string, needle: string) {
  // Simple and safe: avoid regex injection
  let count = 0;
  let idx = 0;
  while (true) {
    idx = haystack.indexOf(needle, idx);
    if (idx === -1) break;
    count++;
    idx += needle.length;
  }
  return count;
}

/**
 * Give rarer/longer tokens slightly higher weight.
 * Example:
 *  - "field" (common) -> smaller weight
 *  - "capacitance" (rare) -> bigger weight
 */
function tokenWeight(token: string) {
  const len = token.length;
  if (len >= 10) return 2.2;
  if (len >= 7) return 1.6;
  return 1.0;
}
