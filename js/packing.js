let packingTab = null;
let shownPackingId = null;
let editingPacking = false;

function packingChip(ev, active) {
  const start = eventStart(ev);
  return `<a class="bonbon chip flavor-${EVENT_TYPES[ev.type].flavor} ${active ? 'is-active' : ''}" href="#packliste/${ev.id}" ${active ? 'aria-current="true"' : ''}>
    ${wrapperEnd('left')}
    <span class="bonbon-body">
      <span class="chip-name">${esc(ev.name)}</span>
      <span class="chip-count">${start.getDate()}. ${shortMonth.format(start)}</span>
    </span>
    ${wrapperEnd('right')}
  </a>`;
}

function packItem(item) {
  return `<li class="pack ${item.done ? 'is-done' : ''}" data-item="${item.id}">
    <button type="button" class="bonbon pack-btn flavor-waldmeister" aria-pressed="${item.done}">
      ${wrapperEnd('left')}
      <span class="bonbon-body">
        <span class="candy">${icon('check', 16)}</span>
        <span class="pack-label">${esc(item.label)}</span>
      </span>
      ${wrapperEnd('right')}
    </button>
    <button type="button" class="icon-btn small remove" data-remove="${item.id}" aria-label="${esc(item.label)} entfernen">${icon('close', 18)}</button>
  </li>`;
}

function packingPanel(ev) {
  const start = eventStart(ev);
  return `<section class="paper packing flavor-waldmeister ${isComplete(ev.packing) ? 'is-complete' : ''} ${editingPacking ? 'is-editing' : ''}">
    <div class="paper-head">
      <div>
        <h2>${esc(ev.name)}</h2>
        <p class="muted">${EVENT_TYPES[ev.type].label} am ${longDate.format(start)} (${relativeDay(start)})</p>
      </div>
      <div class="paper-tools">
        <button type="button" class="btn btn-ghost btn-small" data-edit>${editingPacking ? 'Fertig' : `${icon('pencil', 18)} Bearbeiten`}</button>
      </div>
    </div>
    <div class="status-line">
      <span class="seal" aria-hidden="true">${icon('check', 22)}</span>
      <p class="status-text">${packingLine(ev.packing)}</p>
      ${stick(countDone(ev.packing), ev.packing.length, 'Tasche gepackt')}
    </div>
    <ul class="pack-grid">${ev.packing.map(packItem).join('')}</ul>
    <form class="add-row add-row-wide" data-add>
      <input name="label" placeholder="Noch was für diesen Termin" aria-label="Neue Sache für die Packliste" autocomplete="off">
      <button type="submit" class="icon-btn" aria-label="Hinzufügen">${icon('plus')}</button>
    </form>
    <div class="paper-foot">
      <button type="button" class="btn btn-ghost btn-small" data-unpack>${icon('reset', 18)} Alles auspacken</button>
      <button type="button" class="btn btn-ghost btn-small" data-reload>Liste neu aus der Vorlage</button>
    </div>
  </section>`;
}

function templateColumn(type) {
  const info = EVENT_TYPES[type];
  return `<section class="template flavor-${info.flavor}" data-template="${type}">
    <h2>${info.label}</h2>
    <ul class="template-list">${state.templates[type].map((label, i) => `<li>
      <span>${esc(label)}</span>
      <button type="button" class="icon-btn small" data-remove-template="${i}" aria-label="${esc(label)} aus der Vorlage nehmen">${icon('close', 18)}</button>
    </li>`).join('')}</ul>
    <form class="add-row" data-add-template>
      <input name="label" placeholder="Sache dazu" aria-label="Neue Sache für ${info.label}" autocomplete="off">
      <button type="submit" class="icon-btn" aria-label="Hinzufügen">${icon('plus')}</button>
    </form>
  </section>`;
}

function templatesPanel(hasEvents) {
  return `${hasEvents ? '' : `<div class="empty">
      ${emptyArt('packliste')}
      <p class="empty-title">Noch nichts zu packen</p>
      <p class="muted">Sobald du einen Termin einträgst, bekommt er hier seine eigene Packliste.</p>
      <a class="btn flavor-zitrone" href="#termine/neu">${icon('plus')} Termin eintragen</a>
    </div>`}
  <section class="templates">
    <p class="muted templates-note">${hasEvents
      ? 'Jeder neue Termin bekommt eine frische Packliste aus seiner Vorlage. Was du hier änderst, gilt für alle Termine, die du ab jetzt einträgst.'
      : 'Bis dahin kannst du hier die Vorlagen anpassen.'}</p>
    <div class="template-cols">${templateColumn('auftritt')}${templateColumn('feiern')}</div>
  </section>`;
}

function renderPacking(root, param, entering) {
  if (param) packingTab = param;
  const upcoming = upcomingEvents();
  let ev = packingTab && packingTab !== 'vorlagen' ? findEvent(packingTab) : null;
  if (ev && entering && !param && !upcoming.includes(ev)) {
    ev = null;
    packingTab = null;
  }
  if (!ev && packingTab !== 'vorlagen') ev = (!entering && !param && findEvent(shownPackingId)) || currentEvent(upcoming);
  shownPackingId = ev ? ev.id : null;
  const showingTemplates = !ev;
  const tabs = ev && !upcoming.includes(ev) ? [ev, ...upcoming] : upcoming;

  root.innerHTML = `
    <header class="page-head">
      <h1>Packliste</h1>
      <a class="btn btn-ghost ${showingTemplates ? 'is-active' : ''}" href="#packliste/vorlagen" ${showingTemplates ? 'aria-current="true"' : ''}>${icon('pencil', 18)} Vorlagen</a>
    </header>
    ${tabs.length ? `<nav class="picker" aria-label="Termin auswählen">
      ${tabs.map(item => packingChip(item, item === ev)).join('')}
    </nav>` : ''}
    ${ev ? packingPanel(ev) : templatesPanel(upcoming.length > 0)}`;

  if (ev) bindPacking(root, ev);
  else bindTemplates(root);
}

function bindPacking(root, ev) {
  const paper = root.querySelector('.packing');

  paper.querySelectorAll('.pack-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.pack');
      const item = ev.packing.find(p => p.id === row.dataset.item);
      const wasComplete = isComplete(ev.packing);
      item.done = !item.done;
      save();
      row.classList.toggle('is-done', item.done);
      btn.setAttribute('aria-pressed', item.done);
      pop(btn.querySelector('.candy'));

      const complete = isComplete(ev.packing);
      paper.classList.toggle('is-complete', complete);
      paper.querySelector('.status-text').textContent = packingLine(ev.packing);
      setStick(paper.querySelector('.status-line .stick'), countDone(ev.packing), ev.packing.length);
      if (complete && !wasComplete) {
        pop(paper.querySelector('.seal'));
        candyBurst(paper.querySelector('.status-line'));
      }
    });
  });

  paper.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      ev.packing = ev.packing.filter(p => p.id !== btn.dataset.remove);
      save();
      rerender();
    });
  });

  paper.querySelector('[data-add]').addEventListener('submit', e => {
    e.preventDefault();
    const label = e.target.elements.label.value.trim();
    if (!label) return;
    ev.packing.push({ id: newId(), label, done: false });
    save();
    rerender({ focus: '[data-add] input' });
  });

  paper.querySelector('[data-edit]').addEventListener('click', () => {
    editingPacking = !editingPacking;
    rerender();
  });

  paper.querySelector('[data-unpack]').addEventListener('click', async () => {
    if (countDone(ev.packing) > 0) {
      const ok = await confirmSheet({
        title: 'Alles auspacken?',
        text: `Alle Haken bei „${ev.name}“ gehen raus. Die Sachen bleiben auf der Liste.`,
        confirmLabel: 'Auspacken',
      });
      if (!ok) return;
    }
    ev.packing.forEach(p => { p.done = false; });
    save();
    rerender();
  });

  paper.querySelector('[data-reload]').addEventListener('click', async () => {
    const ok = await confirmSheet({
      title: 'Liste neu aus der Vorlage?',
      text: `Die Packliste für „${ev.name}“ wird durch die Vorlage „${EVENT_TYPES[ev.type].label}“ ersetzt. Abgehaktes und extra Dazugeschriebenes ist dann weg.`,
      confirmLabel: 'Neu laden',
    });
    if (!ok) return;
    ev.packing = packingFromTemplate(ev.type);
    save();
    rerender();
  });
}

function bindTemplates(root) {
  root.querySelectorAll('[data-template]').forEach(column => {
    const list = state.templates[column.dataset.template];
    column.querySelectorAll('[data-remove-template]').forEach(btn => {
      btn.addEventListener('click', () => {
        list.splice(Number(btn.dataset.removeTemplate), 1);
        save();
        rerender();
      });
    });
    column.querySelector('[data-add-template]').addEventListener('submit', e => {
      e.preventDefault();
      const label = e.target.elements.label.value.trim();
      if (!label) return;
      list.push(label);
      save();
      rerender({ focus: `[data-template="${column.dataset.template}"] input` });
    });
  });
}
