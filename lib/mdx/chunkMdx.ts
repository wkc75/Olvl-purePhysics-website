export type Chunk = {
  id: string;
  source: string; // file path
  text: string;
};
 
export function chunkText(
  text: string,
  opts: { chunkSize: number; chunkOverlap: number; sourceLabel: string }
): Chunk[] {
  const { chunkSize, chunkOverlap, sourceLabel } = opts;

  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: Chunk[] = [];
  let start = 0;
  let idx = 0;

  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    const slice = clean.slice(start, end);
    chunks.push({
      id: `${sourceLabel}::${idx}`,
      source: sourceLabel,
      text: slice,
    });
    idx++;
    start = end - chunkOverlap;
    if (start < 0) start = 0;
    if (end === clean.length) break;
  }

  return chunks;
}
