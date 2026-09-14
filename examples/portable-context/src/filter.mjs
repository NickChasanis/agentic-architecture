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

export function filterNotes(notes, query) {
  validate(notes);
  if (typeof query !== 'string') throw new TypeError('query must be a string');
  const needle = query.toLocaleLowerCase();
  return notes.filter(note => !note.archived && note.title.toLocaleLowerCase().includes(needle));
}
