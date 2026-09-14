function validate(notes) {
  if (!Array.isArray(notes)) throw new TypeError('notes must be an array');
  const ids = new Set();
  for (const note of notes) {
    if (!note || typeof note !== 'object' || Array.isArray(note) ||
        typeof note.id !== 'string' || note.id.length === 0 || ids.has(note.id) ||
        typeof note.title !== 'string' || typeof note.archived !== 'boolean' ||
        !Array.isArray(note.tags) || note.tags.some(tag => typeof tag !== 'string')) {
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
  return [...counts].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([tag, count]) => ({tag, count}));
}
