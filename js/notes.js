let noteFilter = 'alle';
let noteQuery = '';

const noteDate = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

function searchText(note) {
  const names = note.kind === 'formation' ? note.formation.dancers.map(d => d.name).join(' ') : '';
  return `${note.title} ${note.body} ${names}`.toLowerCase();
}

function visibleNotes() {
  const query = noteQuery.trim().toLowerCase();
  return state.notes
    .filter(note => noteFilter === 'alle' || note.category === noteFilter)
    .filter(note => !query || searchText(note).includes(query))
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt);
}

function noteCard(note) {
  if (note.kind === 'formation') return formationCard(note);
  const cat = NOTE_CATEGORIES[note.category];
  const [year, month, day] = note.date.split('-').map(Number);
  return `<button type="button" class="note note-${note.category} flavor-brause" data-note="${note.id}">
    <span class="note-title">${esc(note.title || 'Ohne Titel')}</span>
    ${note.body ? `<span class="note-body">${esc(note.body)}</span>` : ''}
    <span class="note-foot">
      <span class="note-cat">${icon(cat.icon, 16)} ${cat.label}</span>
      <span>${noteDate.format(new Date(year, month - 1, day))}</span>
    </span>
  </button>`;
}

function notesGrid() {
  const notes = visibleNotes();
  if (notes.length) return notes.map(noteCard).join('');
  if (noteQuery.trim()) {
    return `<div class="empty grid-empty">
      ${emptyArt('suche')}
      <p class="empty-title">Nichts gefunden</p>
      <p class="muted">Für „${esc(noteQuery.trim())}“ gibt es keine Notiz.</p>
    </div>`;
  }
  if (state.notes.length) {
    return `<div class="empty grid-empty">
      ${emptyArt('suche')}
      <p class="empty-title">Hier ist noch nichts</p>
      <p class="muted">In dieser Rubrik gibt es noch keine Notiz.</p>
    </div>`;
  }
  return `<div class="empty grid-empty">
    ${emptyArt('notizen')}
    <p class="empty-title">Noch keine Notizen</p>
    <p class="muted">Schreib hier mit, was bei der Versammlung rauskommt oder was deine Gruppe als Nächstes üben soll. Aufstellungen für deine Gruppe kannst du auch zeichnen.</p>
  </div>`;
}

function filterButton(key, label) {
  const count = key === 'alle' ? state.notes.length : state.notes.filter(n => n.category === key).length;
  return `<button type="button" class="filter flavor-brause" data-filter="${key}" aria-pressed="${noteFilter === key}">
    ${label} <span class="filter-count">${count}</span>
  </button>`;
}

function renderNotes(root) {
  root.innerHTML = `
    <header class="page-head">
      <h1>Notizen</h1>
      <div class="head-actions">
        <button type="button" class="btn btn-ghost" data-action="new-formation">${icon('users', 20)} Neue Aufstellung</button>
        <button type="button" class="btn flavor-brause" data-action="new-note">${icon('plus')} Neue Notiz</button>
      </div>
    </header>
    <div class="note-tools">
      <div class="filters" role="group" aria-label="Notizen filtern">
        ${filterButton('alle', 'Alle')}
        ${Object.entries(NOTE_CATEGORIES).map(([key, cat]) => filterButton(key, cat.label)).join('')}
      </div>
      <label class="search">
        ${icon('search', 20)}
        <input type="search" value="${esc(noteQuery)}" placeholder="Suchen" aria-label="Notizen durchsuchen">
      </label>
    </div>
    <div class="note-grid">${notesGrid()}</div>`;

  const grid = root.querySelector('.note-grid');
  const bindCards = () => grid.querySelectorAll('[data-note]').forEach(card => {
    card.addEventListener('click', () => {
      const note = state.notes.find(n => n.id === card.dataset.note);
      if (note.kind === 'formation') openFormation(note);
      else openNoteForm(note);
    });
  });
  bindCards();

  root.querySelector('[data-action="new-note"]').addEventListener('click', () => openNoteForm());
  root.querySelector('[data-action="new-formation"]').addEventListener('click', () => openFormation());
  root.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      noteFilter = btn.dataset.filter;
      rerender();
    });
  });
  root.querySelector('.search input').addEventListener('input', e => {
    noteQuery = e.target.value;
    grid.innerHTML = notesGrid();
    bindCards();
    watchArt();
  });
}

function openNoteForm(note) {
  const isNew = !note;
  const data = note || {
    title: '',
    body: '',
    category: noteFilter === 'alle' ? 'training' : noteFilter,
    date: todayIso(),
  };

  openSheet(`<form class="sheet-inner form sheet-wide" novalidate aria-labelledby="note-form-title">
    <header class="sheet-head">
      <h2 id="note-form-title">${isNew ? 'Neue Notiz' : 'Notiz'}</h2>
      <button type="button" class="icon-btn" data-close aria-label="Schließen">${icon('close')}</button>
    </header>
    <fieldset class="type-pick">
      <legend>Wofür?</legend>
      ${Object.entries(NOTE_CATEGORIES).map(([key, cat]) => `<label class="type-option flavor-brause">
        <input type="radio" name="category" value="${key}" ${data.category === key ? 'checked' : ''}>
        <span>${icon(cat.icon, 18)} ${cat.label}</span>
      </label>`).join('')}
    </fieldset>
    <div class="field-row">
      <label class="field grow">
        <span>Titel</span>
        <input name="title" value="${esc(data.title)}" placeholder="z. B. Versammlung im Vereinsheim" autocomplete="off">
      </label>
      <label class="field">
        <span>Datum</span>
        <input type="date" name="date" value="${esc(data.date)}">
      </label>
    </div>
    <label class="field">
      <span>Notiz</span>
      <textarea name="body" rows="9" placeholder="Was wurde besprochen, was muss deine Gruppe üben?">${esc(data.body)}</textarea>
    </label>
    <footer class="sheet-actions">
      ${isNew ? '' : `<button type="button" class="btn btn-ghost btn-danger-text" data-delete>${icon('trash', 20)} Löschen</button>`}
      <button type="submit" class="btn flavor-brause">Speichern</button>
    </footer>
  </form>`);

  const form = sheet.querySelector('form');
  if (isNew) form.elements.title.focus();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const fields = {
      title: values.title.trim(),
      body: values.body.trim(),
      category: values.category,
      date: values.date || todayIso(),
      updatedAt: Date.now(),
    };
    if (!fields.title && !fields.body) {
      closeSheet();
      return;
    }
    if (isNew) state.notes.push({ id: newId(), kind: 'text', ...fields });
    else Object.assign(note, fields);
    save();
    closeSheet();
    rerender();
  });

  form.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const ok = await confirmSheet({
      title: 'Notiz löschen?',
      text: `„${note.title || 'Ohne Titel'}“ ist danach weg.`,
      confirmLabel: 'Löschen',
    });
    if (!ok) return;
    state.notes = state.notes.filter(n => n.id !== note.id);
    save();
    rerender();
  });
}
