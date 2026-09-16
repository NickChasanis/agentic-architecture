function validate(notes) {
  if (!Array.isArray(notes)) throw new TypeError('notes must be an array');
  const ids = new Set();
  for (const note of notes) {
    if (!note || typeof note !== 'object' || Array.isArray(note) ||
        typeof note.id !== 'string' || note.id.length === 0 || ids.has(note.id) ||
        typeof note.title !== 'string' || typeof note.archived !== 'boolean' ||
        !Array.isArray(note.tags) || Array.from(note.tags).some(tag => typeof tag !== 'string')) {
      throw new TypeError('invalid notes');
    }
    ids.add(note.id);
  }
}

export function countTags(notes) {
  validate(notes);
  const counts = new Map();
  for (const note of notes) {
    if (note.archived) continue;
    for (const tag of new Set(note.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  const compareCodePoints = (a, b) => {
    const left = Array.from(a, ch => ch.codePointAt(0));
    const right = Array.from(b, ch => ch.codePointAt(0));
    for (let i = 0; i < Math.min(left.length, right.length); i++) {
      if (left[i] !== right[i]) return left[i] - right[i];
    }
    return left.length - right.length;
  };
  return [...counts].sort(([a], [b]) => compareCodePoints(a, b))
    .map(([tag, count]) => ({tag, count}));
}
