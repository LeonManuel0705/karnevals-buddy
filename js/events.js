let pastOpen = false;

function eventRow(ev) {
  const start = eventStart(ev);
  const type = EVENT_TYPES[ev.type];
  const costume = findCostume(ev.costumeId);
  const details = [
    ev.meetTime && `${icon('users', 18)} Treffen ${ev.meetTime}`,
    `${icon('clock', 18)} ${formatTime(ev)}`,
    ev.place && `${icon('pin', 18)} ${esc(ev.place)}`,
    ev.people && `${icon('users', 18)} ${esc(ev.people)}`,
    costume && `${icon('shirt', 18)} ${esc(costume.name)}`,
  ].filter(Boolean);

  return `<li>
    <button type="button" class="bonbon bonbon-row flavor-${type.flavor}" data-event="${ev.id}">
      ${wrapperEnd('left')}
      <span class="bonbon-body">
        <span class="date-chip"><b>${start.getDate()}</b><small>${shortMonth.format(start)}</small></span>
        <span class="row-main">
          <span class="row-title">${esc(ev.name)}</span>
          <span class="row-meta">${details.map(d => `<span>${d}</span>`).join('')}</span>
        </span>
        <span class="row-side">
          <span class="tag">${type.label}</span>
          <span class="row-when">${relativeDay(start)}</span>
        </span>
      </span>
      ${wrapperEnd('right')}
    </button>
  </li>`;
}

function renderEvents(root, param) {
  const upcoming = upcomingEvents();
  const past = pastEvents();

  root.innerHTML = `
    <header class="page-head">
      <h1>Termine</h1>
      <button type="button" class="btn flavor-zitrone" data-action="new-event">${icon('plus')} Neuer Termin</button>
    </header>
    ${upcoming.length
      ? `<ul class="event-list">${upcoming.map(eventRow).join('')}</ul>`
      : `<div class="empty">
          ${emptyArt('termine')}
          <p class="empty-title">Noch keine Termine</p>
          <p class="muted">Trag deinen nächsten Auftritt oder die nächste Party ein. Jeder Termin bekommt seine eigene Packliste.</p>
          <button type="button" class="btn flavor-zitrone" data-action="first-event">${icon('plus')} Ersten Termin eintragen</button>
        </div>`}
    ${past.length ? `<details class="past" ${pastOpen ? 'open' : ''}>
      <summary>Schon vorbei <span class="muted">(${past.length})</span></summary>
      <ul class="event-list is-past">${past.map(eventRow).join('')}</ul>
    </details>` : ''}`;

  root.querySelector('[data-action="new-event"]').addEventListener('click', () => openEventForm());
  root.querySelector('[data-action="first-event"]')?.addEventListener('click', () => openEventForm());
  root.querySelector('.past')?.addEventListener('toggle', e => {
    pastOpen = e.currentTarget.open;
  });
  root.querySelectorAll('[data-event]').forEach(btn => {
    btn.addEventListener('click', () => openEventForm(findEvent(btn.dataset.event)));
  });

  if (param) {
    history.replaceState(null, '', '#termine');
    if (param === 'neu') openEventForm();
    else if (findEvent(param)) openEventForm(findEvent(param));
  }
}

function switchPacking(items, fromType, toType) {
  const oldLabels = state.templates[fromType];
  const newLabels = state.templates[toType];
  const kept = items.filter(item => item.done || !oldLabels.includes(item.label) || newLabels.includes(item.label));
  const have = kept.map(item => item.label);
  return [
    ...kept,
    ...newLabels.filter(label => !have.includes(label)).map(label => ({ id: newId(), label, done: false })),
  ];
}

function openEventForm(ev) {
  const isNew = !ev;
  const data = ev || { type: 'auftritt', name: '', date: '', time: '', meetTime: '', place: '', people: '', costumeId: '' };

  openSheet(`<form class="sheet-inner form" novalidate aria-labelledby="event-form-title">
    <header class="sheet-head">
      <h2 id="event-form-title">${isNew ? 'Neuer Termin' : 'Termin ändern'}</h2>
      <button type="button" class="icon-btn" data-close aria-label="Schließen">${icon('close')}</button>
    </header>
    <fieldset class="type-pick">
      <legend>Was steht an?</legend>
      ${Object.entries(EVENT_TYPES).map(([key, type]) => `<label class="type-option flavor-${type.flavor}">
        <input type="radio" name="type" value="${key}" ${data.type === key ? 'checked' : ''}>
        <span>${type.label}</span>
      </label>`).join('')}
    </fieldset>
    <label class="field">
      <span>Name</span>
      <input name="name" value="${esc(data.name)}" placeholder="z. B. Prunksitzung" autocomplete="off">
    </label>
    <div class="field-row field-row-3">
      <label class="field">
        <span>Datum</span>
        <input type="date" name="date" value="${esc(data.date)}">
      </label>
      <label class="field">
        <span>Treffen um</span>
        <input type="time" name="meetTime" value="${esc(data.meetTime)}">
      </label>
      <label class="field">
        <span>Beginn</span>
        <input type="time" name="time" value="${esc(data.time)}">
      </label>
    </div>
    <div class="field-row">
      <label class="field">
        <span>Ort</span>
        <input name="place" value="${esc(data.place)}" placeholder="z. B. Stadthalle" autocomplete="off">
      </label>
      <label class="field">
        <span>Wer kommt mit?</span>
        <input name="people" value="${esc(data.people)}" placeholder="z. B. Lena und Mia" autocomplete="off">
      </label>
    </div>
    <label class="field">
      <span>Welches Kostüm?</span>
      <select name="costumeId">
        <option value="">Noch offen</option>
        ${state.costumes.map(c => `<option value="${c.id}" ${c.id === data.costumeId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
      </select>
    </label>
    <p class="form-error" role="alert" hidden></p>
    <footer class="sheet-actions">
      ${isNew ? '' : `<button type="button" class="btn btn-ghost btn-danger-text" data-delete>${icon('trash', 20)} Löschen</button>`}
      <button type="submit" class="btn flavor-zitrone">${isNew ? 'Eintragen' : 'Speichern'}</button>
    </footer>
  </form>`);

  const form = sheet.querySelector('form');
  const error = form.querySelector('.form-error');
  if (isNew) form.elements.name.focus();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const name = values.name.trim();
    if (!name) {
      error.textContent = 'Wie heißt der Termin? Trag oben noch einen Namen ein.';
      error.hidden = false;
      form.elements.name.focus();
      return;
    }
    if (!values.date) {
      error.textContent = 'Wann ist der Termin? Es fehlt noch das Datum.';
      error.hidden = false;
      form.elements.date.focus();
      return;
    }
    if (values.meetTime && values.time && values.meetTime > values.time) {
      error.textContent = 'Das Treffen liegt nach dem Beginn. Schau nochmal auf die Uhrzeiten.';
      error.hidden = false;
      form.elements.meetTime.focus();
      return;
    }

    const fields = {
      name,
      type: values.type,
      date: values.date,
      time: values.time,
      meetTime: values.meetTime,
      place: values.place.trim(),
      people: values.people.trim(),
      costumeId: values.costumeId,
    };

    if (isNew) {
      state.events.push({ id: newId(), ...fields, packing: packingFromTemplate(fields.type) });
    } else {
      if (fields.type !== ev.type) ev.packing = switchPacking(ev.packing, ev.type, fields.type);
      Object.assign(ev, fields);
    }
    save();
    closeSheet();
    rerender();
    if (isNew) toast(`${name} ist eingetragen`);
  });

  form.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const ok = await confirmSheet({
      title: `${ev.name} löschen?`,
      text: 'Der Termin und seine Packliste sind dann weg.',
      confirmLabel: 'Löschen',
    });
    if (!ok) return;
    state.events = state.events.filter(item => item.id !== ev.id);
    save();
    rerender();
  });
}
