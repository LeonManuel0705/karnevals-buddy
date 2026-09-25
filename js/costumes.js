let currentCostumeId = null;
let editingCostume = false;

function costumeStatus(costume) {
  const open = costume.parts.length - countDone(costume.parts);
  if (!costume.parts.length) return 'Trag ein, was alles zum Kostüm gehört.';
  if (open === 0) return 'Alles fertig! Das Kostüm ist bereit.';
  return `Noch ${open} ${open === 1 ? 'Teil' : 'Teile'}, dann ist alles fertig.`;
}

function costumeChip(costume, active) {
  return `<a class="bonbon chip flavor-veilchen ${active ? 'is-active' : ''}" href="#kostuem/${costume.id}" data-costume="${costume.id}" ${active ? 'aria-current="true"' : ''}>
    ${wrapperEnd('left')}
    <span class="bonbon-body">
      <span class="chip-name">${esc(costume.name)}</span>
      <span class="chip-count">${countDone(costume.parts)}/${costume.parts.length}</span>
    </span>
    ${wrapperEnd('right')}
  </a>`;
}

function partRow(part) {
  return `<li class="tick ${part.done ? 'is-done' : ''}" data-part="${part.id}">
    <button type="button" class="tick-btn" aria-pressed="${part.done}">
      <span class="candy">${icon('check', 18)}</span>
      <span class="tick-label">${esc(part.label)}</span>
    </button>
    <button type="button" class="icon-btn small remove" data-remove="${part.id}" aria-label="${esc(part.label)} entfernen">${icon('close', 18)}</button>
  </li>`;
}

function groupColumn(costume, group) {
  const parts = costume.parts.filter(p => p.group === group.key);
  return `<section class="group" data-group="${group.key}">
    <h3>${group.label} <span class="count">${countDone(parts)}/${parts.length}</span></h3>
    <ul class="ticks">${parts.map(partRow).join('')}</ul>
    <form class="add-row" data-add="${group.key}">
      <input name="label" placeholder="Teil dazu" aria-label="Neues Teil bei ${group.label}" autocomplete="off">
      <button type="submit" class="icon-btn" aria-label="Hinzufügen">${icon('plus')}</button>
    </form>
  </section>`;
}

function renderCostumes(root, param) {
  if (param) currentCostumeId = param;
  const costume = findCostume(currentCostumeId) || state.costumes[0];
  if (costume) currentCostumeId = costume.id;

  root.innerHTML = `
    <header class="page-head">
      <h1>Kostüm</h1>
      <button type="button" class="btn flavor-veilchen" data-action="new-costume">${icon('plus')} Neues Kostüm</button>
    </header>
    ${costume ? `
      <nav class="picker" aria-label="Kostüm auswählen">${state.costumes.map(c => costumeChip(c, c === costume)).join('')}</nav>
      <section class="paper costume flavor-veilchen ${isComplete(costume.parts) ? 'is-complete' : ''} ${editingCostume ? 'is-editing' : ''}">
        <div class="paper-head">
          <input class="title-input" value="${esc(costume.name)}" aria-label="Name des Kostüms" data-rename>
          <div class="paper-tools">
            <button type="button" class="btn btn-ghost btn-small" data-edit>${editingCostume ? 'Fertig' : `${icon('pencil', 18)} Bearbeiten`}</button>
            <button type="button" class="icon-btn" data-delete aria-label="Kostüm löschen">${icon('trash')}</button>
          </div>
        </div>
        <div class="status-line">
          <span class="seal" aria-hidden="true">${icon('check', 22)}</span>
          <p class="status-text">${costumeStatus(costume)}</p>
          ${stick(countDone(costume.parts), costume.parts.length, 'Kostüm fertig')}
        </div>
        <div class="groups">${COSTUME_GROUPS.map(g => groupColumn(costume, g)).join('')}</div>
      </section>` : `
      <div class="empty">
        ${emptyArt('kostuem')}
        <p class="empty-title">Noch kein Kostüm</p>
        <p class="muted">Leg eins an, zum Beispiel deine Gardeuniform, und hak ab, was schon bereit ist.</p>
        <button type="button" class="btn flavor-veilchen" data-action="first-costume">${icon('plus')} Erstes Kostüm anlegen</button>
      </div>`}`;

  root.querySelector('[data-action="new-costume"]').addEventListener('click', openCostumeForm);
  root.querySelector('[data-action="first-costume"]')?.addEventListener('click', openCostumeForm);
  if (!costume) return;

  const paper = root.querySelector('.costume');

  paper.querySelectorAll('.tick-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleCostumePart(costume, btn.closest('.tick'), root));
  });

  paper.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      costume.parts = costume.parts.filter(p => p.id !== btn.dataset.remove);
      save();
      rerender();
    });
  });

  paper.querySelectorAll('[data-add]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const label = form.elements.label.value.trim();
      if (!label) return;
      costume.parts.push({ id: newId(), group: form.dataset.add, label, done: false });
      save();
      rerender({ focus: `[data-add="${form.dataset.add}"] input` });
    });
  });

  paper.querySelector('[data-rename]').addEventListener('change', e => {
    const name = e.target.value.trim();
    if (!name) {
      e.target.value = costume.name;
      return;
    }
    costume.name = name;
    save();
    root.querySelector(`.chip[data-costume="${costume.id}"] .chip-name`).textContent = name;
  });

  paper.querySelector('[data-edit]').addEventListener('click', () => {
    editingCostume = !editingCostume;
    rerender();
  });

  paper.querySelector('[data-delete]').addEventListener('click', async () => {
    const ok = await confirmSheet({
      title: `${costume.name} löschen?`,
      text: 'Alle Teile auf der Liste sind dann weg. Termine mit diesem Kostüm stehen danach auf „Noch offen“.',
      confirmLabel: 'Löschen',
    });
    if (!ok) return;
    state.costumes = state.costumes.filter(c => c.id !== costume.id);
    state.events.forEach(ev => {
      if (ev.costumeId === costume.id) ev.costumeId = '';
    });
    currentCostumeId = null;
    save();
    rerender();
  });
}

function toggleCostumePart(costume, row, root) {
  const part = costume.parts.find(p => p.id === row.dataset.part);
  const wasComplete = isComplete(costume.parts);
  part.done = !part.done;
  save();

  row.classList.toggle('is-done', part.done);
  row.querySelector('.tick-btn').setAttribute('aria-pressed', part.done);
  pop(row.querySelector('.candy'));

  const paper = root.querySelector('.costume');
  const complete = isComplete(costume.parts);
  paper.classList.toggle('is-complete', complete);
  paper.querySelector('.status-text').textContent = costumeStatus(costume);
  setStick(paper.querySelector('.status-line .stick'), countDone(costume.parts), costume.parts.length);

  const group = row.closest('.group');
  const groupParts = costume.parts.filter(p => p.group === group.dataset.group);
  group.querySelector('.count').textContent = `${countDone(groupParts)}/${groupParts.length}`;
  root.querySelector(`.chip[data-costume="${costume.id}"] .chip-count`).textContent = `${countDone(costume.parts)}/${costume.parts.length}`;

  if (complete && !wasComplete) {
    pop(paper.querySelector('.seal'));
    candyBurst(paper.querySelector('.status-line'));
  }
}

function openCostumeForm() {
  openSheet(`<form class="sheet-inner form sheet-small" novalidate aria-labelledby="costume-form-title">
    <header class="sheet-head">
      <h2 id="costume-form-title">Neues Kostüm</h2>
      <button type="button" class="icon-btn" data-close aria-label="Schließen">${icon('close')}</button>
    </header>
    <label class="field">
      <span>Wie heißt es?</span>
      <input name="name" placeholder="z. B. Marienkäfer" autocomplete="off">
    </label>
    <p class="form-error" role="alert" hidden></p>
    <footer class="sheet-actions">
      <button type="submit" class="btn flavor-veilchen">Anlegen</button>
    </footer>
  </form>`);

  const form = sheet.querySelector('form');
  form.elements.name.focus();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    if (!name) {
      const error = form.querySelector('.form-error');
      error.textContent = 'Gib dem Kostüm noch einen Namen.';
      error.hidden = false;
      return;
    }
    const costume = { id: newId(), name, parts: [] };
    state.costumes.push(costume);
    currentCostumeId = costume.id;
    save();
    closeSheet();
    location.hash = `#kostuem/${costume.id}`;
  });
}
