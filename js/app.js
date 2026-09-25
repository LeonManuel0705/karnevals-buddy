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

async function downloadBackup() {
  const name = `karnevals-buddy-${todayIso()}.json`;
  const file = new File([JSON.stringify(state, null, 2)], name, { type: 'application/json' });

  if (navigator.maxTouchPoints > 0 && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
    } catch (err) {
      if (err.name !== 'AbortError') toast('Das Speichern hat nicht geklappt.');
    }
    return;
  }

  // Safari asks before it downloads and only reads the blob afterwards, so the URL has to live a while.
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  sheet.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

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
    text: 'Alles, was gerade in der App steht, wird durch die Sicherung ersetzt.',
    confirmLabel: 'Laden',
  });
  if (!ok) return;
  try {
    keepCopy('vor-import', localStorage.getItem(STORAGE_KEY) ?? '');
  } catch (err) {
    console.warn(err);
  }
  const previous = state;
  state = normalizeState(data);
  if (!save({ quiet: true })) {
    try {
      localStorage.removeItem(`${STORAGE_KEY}-vor-import`);
    } catch (err) {
      console.warn(err);
    }
    if (!save({ quiet: true })) {
      state = previous;
      toast('Die Sicherung passt nicht in den Speicher. Es bleibt alles wie vorher.');
      return;
    }
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
      <div class="button-row">
        <button type="button" class="btn btn-ghost" data-export>${icon('download', 20)} Sicherung speichern</button>
        <label class="btn btn-ghost">${icon('upload', 20)} Sicherung laden
          <input type="file" accept="application/json,.json" class="visually-hidden" data-import>
        </label>
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
  form.querySelector('[data-import]').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) importBackup(file);
  });
  form.querySelector('[data-wipe]').addEventListener('click', async () => {
    const ok = await confirmSheet({
      title: 'Wirklich alles löschen?',
      text: 'Termine, Kostüme, Packlisten und Notizen sind danach weg. Das lässt sich nicht rückgängig machen.',
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
  if (document.hidden || sheet.open) return;
  if (currentSection.key === 'start' || renderedDay !== todayIso()) rerender();
});
window.addEventListener('resize', () => moveBlob(false));
document.fonts?.ready.then(() => moveBlob(false));
route();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js');
  navigator.storage?.persist?.().catch(() => {});
}
