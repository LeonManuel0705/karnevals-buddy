const SECTIONS = [
  { key: 'start', label: 'Start', icon: 'home', flavor: 'himbeer', render: renderStart },
  { key: 'termine', label: 'Termine', icon: 'calendar', flavor: 'zitrone', render: renderEvents },
  { key: 'kostuem', label: 'Kostüm', icon: 'shirt', flavor: 'veilchen', render: renderCostumes },
  { key: 'packliste', label: 'Packliste', icon: 'bag', flavor: 'waldmeister', render: renderPacking },
  { key: 'notizen', label: 'Notizen', icon: 'notes', flavor: 'brause', render: renderNotes },
];

const view = document.getElementById('view');
const nav = document.getElementById('nav');
let currentSection = null;
let cleanupView = null;
let renderedDay = null;

function renderNav() {
  nav.innerHTML = `<span class="nav-blob" aria-hidden="true"></span>
    ${SECTIONS.map(s => `<a class="nav-item" href="#${s.key}" data-key="${s.key}">
      ${icon(s.icon, 24)}<span>${s.label}</span>
    </a>`).join('')}`;
}

function moveBlob(animate) {
  const blob = nav.querySelector('.nav-blob');
  const active = nav.querySelector('.nav-item.is-active');
  if (!active) return;
  blob.className = `nav-blob flavor-${currentSection.flavor}${animate ? '' : ' no-move'}`;
  blob.style.width = `${active.offsetWidth}px`;
  blob.style.height = `${active.offsetHeight}px`;
  blob.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
}

function parseHash() {
  const [key, param] = location.hash.slice(1).split('/');
  let decoded = null;
  if (param) {
    try {
      decoded = decodeURIComponent(param);
    } catch (err) {
      decoded = null;
    }
  }
  return { section: SECTIONS.find(s => s.key === key) || SECTIONS[0], param: decoded };
}

function show(section, param, { entering = false, focus = null } = {}) {
  cleanupView?.();
  cleanupView = section.render(view, param, entering) || null;
  view.className = `view flavor-${section.flavor}`;
  renderedDay = todayIso();
  document.title = section.key === 'start' ? 'Karnevals-Buddy' : `${section.label} · Karnevals-Buddy`;

  watchArt();
  if (focus) view.querySelector(focus)?.focus();
  if (entering && !reducedMotion()) {
    view.animate(
      [{ opacity: 0.3, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
      { duration: 420, easing: EASE_OUT },
    );
  }
}

function route() {
  const { section, param } = parseHash();
  const entering = section !== currentSection;
  const firstRun = !currentSection;
  currentSection = section;

  nav.querySelectorAll('.nav-item').forEach(link => {
    const active = link.dataset.key === section.key;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  moveBlob(!firstRun);

  if (entering) window.scrollTo(0, 0);
  show(section, param, { entering: entering && !firstRun });
}

function rerender(options = {}) {
  const scroll = window.scrollY;
  show(currentSection, null, options);
  window.scrollTo(0, scroll);
}

let backupTappedAt = -Infinity;

async function downloadBackup() {
  if (storageUnreadable) {
    toast(STORAGE_UNREADABLE_TEXT, { urgent: true });
    return;
  }
  if (state.damagedAt) {
    const ok = await confirmSheet({
      title: 'Erst die alten Daten klären',
      text: `Gerade sind deine alten Daten nicht geladen, in der Sicherung fehlten sie also. ${olderStates().some(copy => copy.data)
        ? 'Hol sie unter „Ältere Stände“ zurück oder wähle auf Start „Ohne sie weitermachen“, dann geht die Sicherung wieder.'
        : 'Einen früheren Stand gibt es hier nicht. Wähle auf Start „Ohne sie weitermachen“, dann geht die Sicherung wieder.'}`,
      confirmLabel: 'Ältere Stände ansehen',
    });
    if (ok) showOlderStates();
    return;
  }
  if (performance.now() - backupTappedAt < 1000) return;
  backupTappedAt = performance.now();
  const now = Date.now();
  const name = `karnevals-buddy-${todayIso()}.json`;
  const result = await shareOrSave(new File([JSON.stringify({ ...state, lastBackupAt: now }, null, 2)], name, { type: 'application/json' }));
  if (!result) return;
  if (result === 'shared') state.lastBackupAt = now;
  else state.backupSnoozedUntil = now + BACKUP_EVERY;
  save();
  const line = sheet.querySelector('[data-last-backup]');
  if (line) line.textContent = lastBackupText();
  rerender();
}

function lastBackupText() {
  return state.lastBackupAt
    ? `Letzte Sicherung: ${noteDate.format(new Date(state.lastBackupAt))}.`
    : 'Hier ist noch keine Sicherung vermerkt.';
}

const stateSummary = data => [
  counted(data.events, 'Termin', 'Termine'),
  counted(data.costumes, 'Kostüm', 'Kostüme'),
  counted(data.notes, 'Notiz', 'Notizen'),
  ...(Array.isArray(data.groups) && data.groups.length ? [counted(data.groups, 'Gruppe', 'Gruppen')] : []),
].join(', ');

const copyTime = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' });

function labelWithTime(label, time) {
  const date = new Date(Number(time));
  return Number.isNaN(date.getTime()) || !time ? label : `${label}, ${copyTime.format(date)}`;
}

function dayOfCopy(key) {
  const [year, month, day] = key.slice(-10).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? '' : noteDate.format(date);
}

function olderStates() {
  let current = null;
  try {
    current = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    return [];
  }
  const entry = (key, label, always = false) => {
    let raw = null;
    try {
      raw = localStorage.getItem(key);
    } catch (err) {
      return null;
    }
    if (!raw || (!always && raw === current)) return null;
    let data = null;
    try {
      const parsed = JSON.parse(raw);
      if (isValidState(parsed)) data = normalizeState(parsed);
    } catch (err) {
      console.warn('Kopie ließ sich nicht lesen', key);
    }
    return { key, label, raw, data };
  };
  const beforeLabel = key => {
    const [, time, kind] = key.slice(BEFORE_PREFIX.length).match(/^(\d+)-(.+)$/) || [];
    return labelWithTime(kind === 'import' ? 'Vor dem Laden einer Sicherung' : 'Vor dem Zurückholen', time);
  };
  const damaged = storedKeys(UNREADABLE_KEY).reverse().map(key => entry(key, labelWithTime('Beschädigte Daten', key.slice(UNREADABLE_KEY.length + 1)), true));
  if (unreadableRaw && !damaged.some(copy => copy?.raw === unreadableRaw)) damaged.unshift({ key: null, label: 'Beschädigte Daten', raw: unreadableRaw, data: null });
  return [
    ...storedKeys(BEFORE_PREFIX).reverse().map(key => entry(key, beforeLabel(key))),
    entry(IMPORT_KEY, 'Vor dem Laden einer Sicherung'),
    ...dailyKeys().reverse().map(key => entry(key, dayOfCopy(key))),
    ...storedKeys(UPDATE_PREFIX).reverse().map(key => entry(key, `Vor einem Update (Stand ${key.slice(UPDATE_PREFIX.length)})`)),
    ...damaged,
  ].filter(Boolean);
}

async function restoreOlderState(copy) {
  const ok = await confirmSheet({
    title: 'Diesen Stand zurückholen?',
    text: `${copy.label}: ${stateSummary(copy.data)}.${JSON.stringify(state) === untouchedText ? '' : ' Was gerade in der App steht, wird dadurch ersetzt und bleibt als Kopie unter „Ältere Stände“ liegen.'}`,
    confirmLabel: 'Zurückholen',
  });
  if (!ok) return;
  copy.data.lastBackupAt = Math.max(copy.data.lastBackupAt, state.lastBackupAt);
  if (!replaceStored('zurueck', copy.data, copy)) {
    toast('Das ging nicht, vermutlich ist zu wenig Speicher frei. Es bleibt alles wie vorher.', { urgent: true });
    return;
  }
  rerender();
  toast('Der ältere Stand ist wieder da.');
}

function showOlderStates() {
  openSettings();
  openOlderStates();
}

function openOlderStates() {
  if (storageUnreadable) {
    toast(STORAGE_UNREADABLE_TEXT, { urgent: true });
    return;
  }
  const states = olderStates();
  const back = openSubSheet(`<div class="sheet-inner sheet-small groups-sheet">
    <header class="sheet-head">
      <h2>Ältere Stände</h2>
      <button type="button" class="icon-btn" data-back aria-label="Zurück">${icon('close')}</button>
    </header>
    <p class="muted">${state.damagedAt
      ? 'Solange deine alten Daten nicht geladen sind, bleibt diese Liste, wie sie ist, damit nichts verdrängt wird. Sie liegt nur auf diesem iPad und ersetzt keine Sicherung.'
      : 'Der Buddy merkt sich an jedem Tag, an dem du ihn öffnest, wie alles aussah, und hebt bis zu fünf davon auf. Sie liegen nur auf diesem iPad und ersetzen keine Sicherung.'}</p>
    <div class="group-list">
      ${states.length ? states.map((copy, i) => `<div class="group-row">
        <p><strong>${esc(copy.label)}</strong><span class="muted">${copy.data ? esc(stateSummary(copy.data)) : 'Lässt sich nicht öffnen'}</span></p>
        <div class="group-actions">
          ${copy.data
            ? `<button type="button" class="btn btn-ghost btn-small" data-restore="${i}">${icon('reset', 18)} Zurückholen</button>`
            : `<button type="button" class="btn btn-ghost btn-small" data-save-copy="${i}">${icon('download', 18)} Als Datei sichern</button>`}
        </div>
      </div>`).join('') : `<p class="muted">${state.damagedAt ? 'Hier liegt kein älterer Stand.' : 'Noch kein älterer Stand da. Der Buddy merkt sich einen, sobald sich etwas geändert hat.'}</p>`}
    </div>
  </div>`);
  sheet.querySelector('[data-back]').addEventListener('click', back);
  sheet.querySelector('.group-list').addEventListener('click', e => {
    const restore = e.target.closest('[data-restore]');
    if (restore) {
      restoreOlderState(states[Number(restore.dataset.restore)]);
      return;
    }
    const saveCopy = e.target.closest('[data-save-copy]');
    if (saveCopy) {
      const { raw } = states[Number(saveCopy.dataset.saveCopy)];
      shareOrSave(new File([raw], `karnevals-buddy-kopie-${todayIso()}.json`, { type: 'application/json' })).then(result => {
        if (result !== 'shared' || raw !== unreadableRaw) return;
        unreadableKept = true;
        if (unsavedOnScreen) save();
      });
    }
  });
}

const counted = (list, one, many) => `${list.length} ${list.length === 1 ? one : many}`;

async function importBackup(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch (err) {
    toast('Mit der Datei stimmt was nicht.');
    return;
  }
  if (!isValidState(data)) {
    toast('Das ist keine Sicherung vom Karnevals-Buddy.');
    return;
  }
  const ok = await confirmSheet({
    title: 'Sicherung laden?',
    text: `In der Datei: ${counted(data.events, 'Termin', 'Termine')}, ${counted(data.costumes, 'Kostüm', 'Kostüme')}, ${counted(data.notes, 'Notiz', 'Notizen')}, ${counted(Array.isArray(data.groups) ? data.groups : [], 'Gruppe', 'Gruppen')}. Alles, was gerade in der App steht, wird dadurch ersetzt.`,
    confirmLabel: 'Laden',
  });
  if (!ok) return;
  let imported;
  try {
    imported = normalizeState(data);
  } catch (err) {
    toast('Mit der Datei stimmt was nicht.');
    return;
  }
  imported.lastBackupAt = Math.max(imported.lastBackupAt, state.lastBackupAt);
  if (!replaceStored('import', imported)) {
    toast('Die Sicherung ließ sich nicht laden, vermutlich ist zu wenig Speicher frei. Es bleibt alles wie vorher.', { urgent: true });
    return;
  }
  rerender();
  toast('Sicherung geladen');
}

function openSettings() {
  openSheet(`<form class="sheet-inner form" novalidate aria-labelledby="settings-title">
    <header class="sheet-head">
      <h2 id="settings-title">Einstellungen</h2>
      <button type="button" class="icon-btn" data-close aria-label="Schließen">${icon('close')}</button>
    </header>
    <label class="field">
      <span>Dein Name</span>
      <input name="name" value="${esc(state.name)}" placeholder="Wie heißt du?" autocomplete="off">
    </label>
    <section class="settings-block">
      <h3>Sicherung</h3>
      <p class="muted">Alles bleibt nur auf diesem iPad, nichts geht ins Internet. Die App auf dem Home-Bildschirm hat ihren eigenen Speicher, getrennt von Safari. Hast du schon was in Safari eingetragen, speicher dort eine Sicherung und lade sie in der App wieder. Ab und zu eine Sicherung schadet nie.</p>
      <p class="muted" data-last-backup>${lastBackupText()}</p>
      <div class="button-row">
        <button type="button" class="btn btn-ghost" data-export>${icon('download', 20)} Sicherung speichern</button>
        <label class="btn btn-ghost">${icon('upload', 20)} Sicherung laden
          <input type="file" accept="application/json,.json" class="visually-hidden" data-import>
        </label>
        <button type="button" class="btn btn-ghost" data-older>${icon('reset', 20)} Ältere Stände</button>
      </div>
    </section>
    <section class="settings-block">
      <h3>Neu anfangen</h3>
      <button type="button" class="btn btn-ghost btn-danger-text" data-wipe>${icon('trash', 20)} Alles löschen</button>
    </section>
    <footer class="sheet-actions">
      <button type="submit" class="btn flavor-himbeer">Fertig</button>
    </footer>
  </form>`);

  const form = sheet.querySelector('form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    state.name = form.elements.name.value.trim();
    save();
    closeSheet();
    rerender();
  });
  form.querySelector('[data-export]').addEventListener('click', downloadBackup);
  form.querySelector('[data-older]').addEventListener('click', openOlderStates);
  form.querySelector('[data-import]').addEventListener('change', e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) importBackup(file);
  });
  form.querySelector('[data-wipe]').addEventListener('click', async () => {
    const ok = await confirmSheet({
      title: 'Wirklich alles löschen?',
      text: 'Termine, Kostüme, Packlisten, Notizen und Gruppen sind danach weg, die älteren Stände auch. Das lässt sich nicht rückgängig machen.',
      confirmLabel: 'Alles löschen',
    });
    if (!ok) return;
    clearCopies();
    replaceState(freshState({ withSample: false }));
    location.hash = '#start';
    rerender();
  });
}

renderNav();
document.getElementById('settings-button').addEventListener('click', openSettings);
window.addEventListener('hashchange', route);
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || e.newValue === null) return;
  state = loadState();
  closeSheet();
  rerender();
});
document.addEventListener('touchstart', () => {}, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  keepDailyCopy();
  if (sheet.open) return;
  if (currentSection.key === 'start' || renderedDay !== todayIso()) rerender();
});
window.addEventListener('resize', () => moveBlob(false));
document.fonts?.ready.then(() => moveBlob(false));
route();
if (storageUnreadable) {
  confirmSheet({
    title: 'Der Speicher lässt sich gerade nicht lesen',
    text: 'Darum sind deine Daten gerade nicht geladen, und der Buddy speichert nichts. Schließ ihn einmal ganz und öffne ihn neu.',
    confirmLabel: 'Verstanden',
    denyLabel: null,
  });
}
if (unreadableOnLoad) {
  const copyNote = unreadableKept
    ? (unreadableRaw === null ? '' : 'Eine Kopie davon ist aufgehoben. ')
    : 'Für eine Kopie ist kein Platz frei. Bis du die Daten unter „Ältere Stände“ als Datei gesichert oder einen früheren Stand zurückgeholt hast, speichert der Buddy nichts Neues. ';
  const olderNote = olderStates().some(copy => copy.data)
    ? 'Unter „Ältere Stände“ kannst du einen früheren Stand zurückholen.'
    : 'Einen früheren Stand gibt es auf diesem iPad nicht.';
  confirmSheet({
    title: 'Deine Daten ließen sich nicht lesen',
    text: `${copyNote}${olderNote}`,
    confirmLabel: 'Ältere Stände ansehen',
  }).then(ok => {
    if (ok) showOlderStates();
  });
}

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js');
  navigator.storage?.persist?.().catch(() => {});
}
