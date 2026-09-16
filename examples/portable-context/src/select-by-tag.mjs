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

export function selectByTag(notes, tag) {
  validate(notes);
  if (typeof tag !== 'string') throw new TypeError('tag must be a string');
  return notes.filter(note => !note.archived && note.tags.includes(tag));
}
