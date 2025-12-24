const H2_KEYWORDS = [
  "kinematics", "dynamics", "newton", "work", "energy", "power",
  "moment", "torque", "circular", "gravitational", "electric field",
  "electric potential", "capacitance", "current", "resistance", "kirchhoff",
  "magnetic field", "electromagnetic", "induction", "ac", "superposition",
  "waves", "diffraction", "interference", "standing wave", "doppler",
  "quantum", "photoelectric", "de broglie", "nuclear", "decay",
  "uncertainty", "errors", "dimensions"
];

const CLEAR_NON_PHYSICS = [
  "leetcode", "binary tree", "react", "next.js", "css", "sql", "investment",
  "history", "politics", "literature", "economics"
];

const UNI_LEVEL_MARKERS = [
  "lagrangian", "hamiltonian", "schrodinger equation", "maxwell equations",
  "tensor", "quantum field", "relativity (general)", "noether"
];

export function classifyScope(q: string): { allowed: boolean; refusal?: string } {
  const s = q.toLowerCase();

  if (CLEAR_NON_PHYSICS.some((k) => s.includes(k))) {
    return {
      allowed: false,
      refusal:
        "I can’t help with that because it’s not within the Singapore H2 Physics syllabus scope. " +
        "If you ask an H2 Physics question (mechanics, E&M, waves, quantum/nuclear at H2 level), I’ll answer in exam-ready format.",
    };
  }

  if (UNI_LEVEL_MARKERS.some((k) => s.includes(k))) {
    return {
      allowed: false,
      refusal:
        "That looks beyond the H2 Physics syllabus (university-level physics). " +
        "If you restate the question in H2 terms, I can help (definitions, standard laws, and exam-style problem solving).",
    };
  }

  // If it looks physics-y enough, allow.
  const looksH2 = H2_KEYWORDS.some((k) => s.includes(k)) || /force|energy|field|wave|current|voltage|moment/.test(s);
  if (!looksH2) {
    return {
      allowed: false,
      refusal:
        "I can only answer within H2 Physics and based on your site notes. " +
        "Your question doesn’t look like an H2 Physics question yet — could you rephrase it using the relevant H2 topic (e.g., forces, fields, circuits, waves, quantum/nuclear)?",
    };
  }

  return { allowed: true };
}
