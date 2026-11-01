const STAGE_W = 1000;
const STAGE_H = 620;
const GRID = 40;
const DANCER_WIDTH = 72;
const GRID_SPOTS = Array.from({ length: 23 * 13 }, (_, i) => [60 + (i % 23) * GRID, 70 + Math.floor(i / 23) * GRID]);
const SNAP_DOTS = GRID_SPOTS.map(([x, y]) => `M${x} ${y}h.01`).join('');
const GUIDE_LINES = [[1, 0], [0, 1], [1, 1], [1, -1]];
const NEW_COLUMNS = [500, 380, 620, 260, 740, 140, 860];
const NEW_ROWS = [470, 350, 230, 110];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const toStage = ([x, y]) => [x * STAGE_W, y * STAGE_H];
const fromStage = ([x, y]) => [x / STAGE_W, y / STAGE_H];
const apart = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const onGrid = point => GRID_SPOTS.some(spot => apart(spot, toStage(point)) < 1);

const graphemes = text => (typeof Intl.Segmenter === 'function'
  ? [...new Intl.Segmenter('de', { granularity: 'grapheme' }).segment(text)].map(part => part.segment)
  : Array.from(text));

function nextFree(used, prefix) {
  let n = 1;
  while (used.has(prefix + n)) n += 1;
  return prefix + n;
}

function newFormationNote() {
  return {
    id: newId(),
    kind: 'formation',
    title: '',
    body: '',
    category: newNoteCategory(),
    date: todayIso(),
    updatedAt: Date.now(),
    formation: { dancers: [], steps: [{ id: newId(), label: 'Bild 1', pos: {} }] },
  };
}

function peopleCount(n) {
  return `${n} ${n === 1 ? 'Person' : 'Leute'}`;
}

function stageFloor() {
  const lines = [260, 500, 740].map(x => `<path class="stage-grid" d="M${x} 40V${STAGE_H - 40}"/>`).join('')
    + [190, 430].map(y => `<path class="stage-grid" d="M40 ${y}H${STAGE_W - 40}"/>`).join('');
  return `<rect class="stage-edge" x="6" y="14" width="${STAGE_W - 12}" height="${STAGE_H - 20}" rx="56"/>
    <rect class="stage-floor" x="6" y="6" width="${STAGE_W - 12}" height="${STAGE_H - 20}" rx="56"/>
    ${lines}`;
}

function formationPreview(formation) {
  const step = formation.steps[0];
  return `<svg class="mini-stage" viewBox="0 0 ${STAGE_W} ${STAGE_H}" aria-hidden="true">
    ${stageFloor()}
    ${formation.dancers.map(d => {
      const [x, y] = step.pos[d.id] || [0.5, 0.5];
      return `<circle class="mini-dancer flavor-${d.flavor}" cx="${x * STAGE_W}" cy="${y * STAGE_H}" r="40"/>`;
    }).join('')}
  </svg>`;
}

function formationCard(note) {
  const { dancers, steps } = note.formation;
  const [year, month, day] = note.date.split('-').map(Number);
  return `<button type="button" class="note note-formation note-${note.category} flavor-brause" data-note="${note.id}">
    ${formationPreview(note.formation)}
    <span class="note-title">${esc(note.title.trim() || 'Aufstellung')}</span>
    <span class="note-foot">
      <span class="note-cat">${icon('users', 16)} ${peopleCount(dancers.length)}, ${steps.length} ${steps.length === 1 ? 'Bild' : 'Bilder'}</span>
      <span>${noteDate.format(new Date(year, month - 1, day))}</span>
    </span>
  </button>`;
}

function dancerShort(name) {
  const clean = (name || '').trim();
  if (!clean) return '?';
  const chars = graphemes(clean);
  return chars.length <= 2 ? clean : chars[0].toUpperCase();
}

const hasLongName = name => graphemes((name || '').trim()).length > 2;

function snapSpot(point, others) {
  const target = toStage(point);
  const placed = others.map(toStage);
  const free = GRID_SPOTS.filter(spot => placed.every(other => apart(spot, other) >= DANCER_WIDTH));
  return fromStage((free.length ? free : GRID_SPOTS).reduce((best, spot) => (apart(spot, target) < apart(best, target) ? spot : best)));
}

function freeSpot(pos) {
  const taken = Object.values(pos);
  const placed = taken.map(toStage);
  for (const y of NEW_ROWS) {
    for (const x of NEW_COLUMNS) {
      if (placed.every(other => apart(other, [x, y]) > 80)) return fromStage([x, y]);
    }
  }
  return snapSpot([0.5, 0.5], taken);
}

function copyOfFormation(note) {
  const base = (note.title.trim() || 'Aufstellung').replace(/ Kopie \d+$/, '').slice(0, 50);
  const copy = JSON.parse(JSON.stringify(note));
  copy.id = newId();
  copy.title = nextFree(new Set(state.notes.map(n => n.title)), `${base} Kopie `);
  copy.date = todayIso();
  copy.updatedAt = Date.now();
  copy.formation.steps.forEach(step => { step.id = newId(); });
  return copy;
}

function openFormation(existing) {
  const note = existing || newFormationNote();
  const formation = note.formation;
  let stepIndex = 0;
  let selected = null;
  let stored = Boolean(existing);
  let changed = false;
  let playTimer = null;
  let confirmTimer = null;
  let armedAt = 0;
  let disarm = null;
  let stepUndo = null;
  let picked = new Set();
  let toolTab = 'leute';
  let stopGesture = null;
  let gestureMoved = false;
  let massTappedAt = 0;
  const openedAt = performance.now();

  openSheet(`<div class="sheet-inner formation-editor" tabindex="-1" autofocus>
    <header class="sheet-head">
      <input class="title-input formation-title" value="${esc(note.title)}" placeholder="Name der Aufstellung" aria-label="Name der Aufstellung" maxlength="60" autocomplete="off">
      <button type="button" class="icon-btn" data-close aria-label="Schließen">${icon('close')}</button>
    </header>
    <div class="step-row">
      <nav class="step-tabs" aria-label="Bilder"></nav>
      <button type="button" class="filter flavor-brause step-ghost" data-ghost>${icon('layers', 20)} Vorheriges Bild</button>
    </div>
    <div class="formation-body">
      <div class="stage-wrap">
        <svg class="stage" viewBox="0 0 ${STAGE_W} ${STAGE_H}" aria-label="Bühne, unten ist das Publikum">
          ${stageFloor()}
          <path class="stage-dots" d="${SNAP_DOTS}"/>
          <clipPath id="stage-clip"><rect x="6" y="6" width="${STAGE_W - 12}" height="${STAGE_H - 20}" rx="56"/></clipPath>
          <g clip-path="url(#stage-clip)">${GUIDE_LINES.map(() => '<path class="stage-guide"/>').join('')}</g>
          <g class="ghosts"></g>
          <g class="dancers"></g>
          <rect class="stage-lasso" rx="14"/>
        </svg>
        <div class="stage-bar">
          <span class="stage-tidy"></span>
          <p class="stage-front">Publikum</p>
          <button type="button" class="filter flavor-brause stage-snap" data-snap>${icon('magnet', 20)} Einrasten</button>
        </div>
        <div class="stage-empty">
          ${emptyArt('aufstellung')}
          <p>Noch niemand auf der Bühne. Tipp auf „Person dazu“.</p>
        </div>
      </div>
      <aside class="formation-tools"></aside>
    </div>
    <footer class="sheet-actions">
      ${existing ? `<button type="button" class="btn btn-ghost btn-danger-text" data-delete>${icon('trash', 20)} Löschen</button>` : ''}
      <button type="button" class="btn btn-ghost" data-share-open>${icon('share', 20)} Teilen</button>
      <button type="button" class="btn btn-ghost" data-copy>${icon('copy', 20)} Kopie</button>
      <button type="button" class="btn flavor-brause" data-close>Fertig</button>
    </footer>
  </div>`);

  const root = sheet.querySelector('.formation-editor');
  const stage = root.querySelector('.stage');
  const layer = root.querySelector('.dancers');
  const tabs = root.querySelector('.step-tabs');
  const tools = root.querySelector('.formation-tools');
  const guides = [...root.querySelectorAll('.stage-guide')];
  const tidySlot = root.querySelector('.stage-tidy');
  const snapButton = root.querySelector('[data-snap]');
  const copyButton = root.querySelector('[data-copy]');
  const shareButton = root.querySelector('[data-share-open]');
  const ghostButton = root.querySelector('[data-ghost]');
  const ghosts = root.querySelector('.ghosts');
  const lasso = root.querySelector('.stage-lasso');
  const currentStep = () => formation.steps[stepIndex];
  const playing = () => playTimer !== null;
  const othersOf = (id, pos) => formation.dancers.filter(d => d.id !== id).map(d => pos[d.id]);
  const isPicked = id => id === selected || picked.has(id);

  function commit() {
    note.updatedAt = Date.now();
    if (!stored) {
      state.notes.push(note);
      stored = true;
    }
    changed = true;
    stepUndo = null;
    save();
    renderStageBar();
  }

  function commitWithUndo(step, before) {
    const history = stepUndo?.step === step ? stepUndo.history : [];
    commit();
    stepUndo = { step, history: [...history, before] };
    renderStageBar();
  }

  function place(group, [x, y]) {
    group.style.transform = `translate(${x * STAGE_W}px, ${y * STAGE_H}px)`;
    const path = ghosts.querySelector(`[data-path="${group.dataset.id}"]`);
    path?.setAttribute('x2', x * STAGE_W);
    path?.setAttribute('y2', y * STAGE_H);
  }

  function renderDancers() {
    const pos = currentStep().pos;
    layer.innerHTML = formation.dancers.map(d => `<g class="dancer flavor-${d.flavor} ${isPicked(d.id) ? 'is-selected' : ''}" data-id="${d.id}" tabindex="0" role="button" aria-label="${esc(d.name || 'Ohne Namen')}, verschiebbar">
      <circle class="dancer-edge" cy="7" r="36"/>
      <circle class="dancer-body" r="36"/>
      <text class="dancer-short" y="12" text-anchor="middle">${esc(dancerShort(d.name))}</text>
      ${hasLongName(d.name) ? `<text class="dancer-name" y="66" text-anchor="middle">${esc(d.name.trim())}</text>` : ''}
    </g>`).join('');
    layer.querySelectorAll('.dancer').forEach(group => place(group, pos[group.dataset.id] || [0.5, 0.5]));
    root.classList.toggle('is-empty', formation.dancers.length === 0);
    renderGhosts();
  }

  function renderGhosts() {
    const before = formation.steps[stepIndex - 1];
    const now = currentStep().pos;
    const show = state.formationGhost && before && !playing();
    ghosts.innerHTML = show ? formation.dancers.map(d => {
      const [fromX, fromY] = toStage(before.pos[d.id] || [0.5, 0.5]);
      const [toX, toY] = toStage(now[d.id] || [0.5, 0.5]);
      return `<line class="ghost-path flavor-${d.flavor}" data-path="${d.id}" x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}"/>
        <g class="ghost flavor-${d.flavor}" transform="translate(${fromX} ${fromY})">
          <circle r="36"/>
          <text y="12" text-anchor="middle">${esc(dancerShort(d.name))}</text>
        </g>`;
    }).join('') : '';
    stage.classList.toggle('has-ghosts', Boolean(show));
    ghostButton.hidden = formation.steps.length < 2;
    ghostButton.setAttribute('aria-pressed', state.formationGhost);
  }

  function renderTabs() {
    tabs.innerHTML = formation.steps.map((step, i) => `<button type="button" class="step-tab ${i === stepIndex ? 'is-active' : ''}" data-step="${i}" aria-pressed="${i === stepIndex}">${esc(step.label)}</button>`).join('')
      + `<button type="button" class="step-tab step-add" data-add-step ${formation.steps.length >= MAX_STEPS ? 'disabled' : ''}>${icon('plus', 18)} Bild</button>`;
    const active = tabs.querySelector('.step-tab.is-active');
    if (!active) return;
    const box = tabs.getBoundingClientRect();
    const tab = active.getBoundingClientRect();
    let delta = 0;
    if (tab.left < box.left) delta = tab.left - box.left - 12;
    else if (tab.right > box.right) delta = tab.right - box.right + 12;
    if (delta) tabs.scrollBy({ left: delta, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  function peoplePanel() {
    const dancer = formation.dancers.find(d => d.id === selected);
    const onStage = formation.dancers.length;
    let detail = `<p class="muted tool-hint">Zieh die Punkte an ihre Plätze. Mit „Einrasten“ landen sie auf dem Raster, so werden Linien gerade. Zieh über die leere Bühne, um mehrere zu markieren. Gespeichert wird automatisch.</p>
      ${onStage > 1 ? '<button type="button" class="btn btn-ghost btn-small" data-pick-all>Alle markieren</button>' : ''}`;
    if (picked.size > 1) {
      detail = `<section class="tool-block">
        <p class="tool-count">${picked.size} markiert</p>
        <p class="muted tool-hint">Zieh einen von ihnen, dann gehen alle mit.</p>
        <button type="button" class="btn btn-ghost btn-small" data-unpick>Markierung aufheben</button>
      </section>`;
    } else if (dancer) {
      detail = `<section class="tool-block">
        <label class="field">
          <span>Name</span>
          <input name="dancerName" value="${esc(dancer.name)}" maxlength="20" autocomplete="off">
        </label>
        <div class="flavor-pick" role="group" aria-label="Farbe">
          ${FLAVORS.map(flavor => `<button type="button" class="flavor-dot flavor-${flavor}" data-flavor="${flavor}" aria-pressed="${dancer.flavor === flavor}" aria-label="${flavor}"></button>`).join('')}
        </div>
        <button type="button" class="btn btn-ghost btn-small btn-danger-text" data-remove-dancer>${icon('trash', 18)} Von der Bühne nehmen</button>
      </section>`;
    }
    const quickGroups = onStage === 0 ? state.groups.map(group => `<button type="button" class="btn btn-ghost btn-small" data-use-group="${group.id}">${icon('users', 18)} ${esc(group.name)} einsetzen</button>`).join('') : '';
    return `<button type="button" class="btn flavor-brause" data-add-dancer ${onStage >= MAX_DANCERS || playing() ? 'disabled' : ''}>${icon('plus')} Person dazu</button>
      ${quickGroups}
      ${detail}
      <button type="button" class="btn btn-ghost btn-small" data-groups>${icon('users', 18)} Gruppen</button>`;
  }

  function shapesPanel() {
    const none = formation.dancers.length === 0 ? 'disabled' : '';
    return `<div class="shape-grid" role="group" aria-label="Schnell-Formen">
        ${Object.entries(SHAPES).map(([key, shape]) => `<button type="button" class="shape-btn" data-shape="${key}" ${none}>${shapeIcon(shape.icon)}<span>${shape.label}</span></button>`).join('')}
      </div>
      <section class="tool-block">
        <p class="tool-count">Spiegeln</p>
        <div class="mirror-row">
          <button type="button" class="btn btn-ghost btn-small" data-mirror="sides" ${none}>${icon('flipSides', 18)} Seiten</button>
          <button type="button" class="btn btn-ghost btn-small" data-mirror="depth" ${none}>${icon('flipDepth', 18)} Vorne, hinten</button>
        </div>
      </section>
      <p class="muted tool-hint">Gilt für dieses Bild. Danach steht unter der Bühne „Rückgängig“.</p>`;
  }

  function picturePanel() {
    return `<label class="field">
        <span>Name vom Bild</span>
        <input name="stepLabel" value="${esc(currentStep().label)}" maxlength="30" autocomplete="off" ${playing() ? 'disabled' : ''}>
      </label>
      ${formation.steps.length > 1 ? `<button type="button" class="btn btn-ghost btn-small btn-danger-text" data-remove-step>${icon('trash', 18)} Bild löschen</button>` : ''}`;
  }

  function renderTools() {
    const none = formation.dancers.length === 0 || playing();
    copyButton.disabled = none;
    shareButton.disabled = none;
    const panels = { leute: peoplePanel, formen: shapesPanel, bild: picturePanel };
    tools.innerHTML = `
      <div class="tool-tabs" role="group" aria-label="Werkzeuge">
        ${[['leute', 'Leute'], ['formen', 'Formen'], ['bild', 'Bild']].map(([key, label]) => `<button type="button" class="filter flavor-brause tool-tab" data-tool-tab="${key}" aria-pressed="${toolTab === key}">${label}</button>`).join('')}
      </div>
      <div class="tool-panel">${panels[toolTab]()}</div>
      <button type="button" class="btn btn-big flavor-himbeer play-btn" data-play ${formation.steps.length < 2 || formation.dancers.length === 0 ? 'disabled' : ''}>
        ${playing() ? `${icon('stop', 20)} Stopp` : `${icon('play', 20)} Abspielen`}
      </button>`;
  }

  function askFirst(button, idleLabel, run, question = ' Wirklich löschen?') {
    if (!button.classList.contains('is-asking')) {
      disarm?.();
      button.classList.add('is-asking');
      button.lastChild.textContent = question;
      armedAt = performance.now();
      disarm = () => {
        clearTimeout(confirmTimer);
        button.classList.remove('is-asking');
        button.lastChild.textContent = idleLabel;
      };
      confirmTimer = setTimeout(disarm, 3000);
      return;
    }
    if (performance.now() - armedAt < 450) return;
    clearTimeout(confirmTimer);
    run();
  }

  function renderStageBar() {
    const pos = currentStep().pos;
    const loose = state.formationSnap && formation.dancers.some(d => !onGrid(pos[d.id]));
    stage.classList.toggle('is-snapping', state.formationSnap);
    snapButton.setAttribute('aria-pressed', state.formationSnap);
    let mode = '';
    if (!playing()) mode = stepUndo?.step === currentStep() ? 'undo' : (loose ? 'tidy' : '');
    if (tidySlot.dataset.mode === mode) return;
    tidySlot.dataset.mode = mode;
    tidySlot.innerHTML = {
      undo: `<button type="button" class="filter flavor-brause" data-undo>${icon('reset', 20)} Rückgängig</button>`,
      tidy: `<button type="button" class="filter flavor-brause" data-tidy>${icon('magnet', 20)} Alle einrasten</button>`,
      '': '',
    }[mode];
    pop(tidySlot.firstElementChild);
  }

  function renderAll() {
    renderTabs();
    renderDancers();
    renderTools();
    renderStageBar();
  }

  function showGuides(point, others) {
    const [x, y] = toStage(point);
    const placed = others.map(toStage);
    guides.forEach((path, i) => {
      const [dx, dy] = GUIDE_LINES[i];
      const inLine = placed.filter(([ox, oy]) => Math.abs((ox - x) * dy - (oy - y) * dx) < 1).length;
      const on = inLine >= (dx && dy ? 2 : 1);
      path.classList.toggle('is-on', on);
      if (on) path.setAttribute('d', `M${x - 1200 * dx} ${y - 1200 * dy}L${x + 1200 * dx} ${y + 1200 * dy}`);
    });
  }

  function hideGuides() {
    guides.forEach(path => path.classList.remove('is-on'));
  }

  function changeWholeStep(change) {
    const step = currentStep();
    const before = { ...step.pos };
    change(step.pos);
    commitWithUndo(step, before);
    setPicked(new Set());
    showStep(stepIndex, true);
  }

  function tidyStep() {
    changeWholeStep(pos => {
      const before = { ...pos };
      const placed = [];
      [...formation.dancers]
        .sort((a, b) => onGrid(before[b.id]) - onGrid(before[a.id]))
        .forEach(d => {
          pos[d.id] = snapSpot(before[d.id], placed);
          placed.push(pos[d.id]);
        });
    });
  }

  function applyShape(key) {
    changeWholeStep(pos => {
      const placed = [];
      SHAPES[key].spots(formation.dancers.length).forEach(spot => placed.push(snapSpot(fromStage(spot), placed)));
      const order = nearestOrder(formation.dancers.map(d => toStage(pos[d.id])), placed.map(toStage));
      formation.dancers.forEach((d, i) => { pos[d.id] = fromStage(order[i]); });
    });
    if (formation.dancers.length > SHAPES[key].limit) toast(SHAPES[key].note);
  }

  function mirrorStep(axis) {
    changeWholeStep(pos => {
      formation.dancers.forEach(d => {
        const [x, y] = pos[d.id];
        pos[d.id] = axis === 'sides' ? [1 - x, y] : [x, clamp(1 - y, 0.07, 0.93)];
      });
    });
  }

  function undoStep() {
    const { step, history } = stepUndo;
    Object.assign(step.pos, history[history.length - 1]);
    commit();
    if (history.length > 1) stepUndo = { step, history: history.slice(0, -1) };
    showStep(stepIndex, true);
  }

  function showStep(i, animate) {
    stepIndex = i;
    stage.classList.toggle('is-gliding', animate && !reducedMotion());
    const pos = currentStep().pos;
    layer.querySelectorAll('.dancer').forEach(group => place(group, pos[group.dataset.id] || [0.5, 0.5]));
    renderTabs();
    renderStageBar();
    renderGhosts();
    if (!playing()) renderTools();
  }

  function stopPlaying() {
    clearTimeout(playTimer);
    playTimer = null;
    root.classList.remove('is-playing');
    renderTools();
    renderStageBar();
    renderGhosts();
  }

  function play() {
    selected = null;
    picked = new Set();
    renderDancers();
    root.classList.add('is-playing');
    let i = 0;
    const advance = () => {
      i += 1;
      if (i >= formation.steps.length) {
        stopPlaying();
        return;
      }
      showStep(i, true);
      playTimer = setTimeout(advance, 1700);
    };
    playTimer = setTimeout(advance, 1400);
    showStep(0, true);
    renderTools();
  }

  function showPicked() {
    layer.querySelectorAll('.dancer').forEach(group => group.classList.toggle('is-selected', isPicked(group.dataset.id)));
  }

  function select(id) {
    selected = id;
    picked = new Set();
    if (id) toolTab = 'leute';
    showPicked();
    renderTools();
  }

  function setPicked(ids) {
    picked = ids;
    selected = null;
    if (ids.size) toolTab = 'leute';
    showPicked();
    renderTools();
  }

  function stagePoint(e) {
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(stage.getScreenCTM().inverse());
    return [point.x / STAGE_W, point.y / STAGE_H];
  }

  function trackPointer(e, onMove, onEnd) {
    const finish = ev => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      stopGesture = null;
      onEnd(ev.type === 'pointercancel');
      if (ev.type === 'pointercancel' && changed) save();
    };
    const move = ev => {
      if (ev.pointerId !== e.pointerId) return;
      if (ev.pointerType === 'mouse' && ev.buttons === 0) {
        finish(ev);
        return;
      }
      onMove(ev);
    };
    const up = ev => {
      if (ev.pointerId === e.pointerId) finish(ev);
    };
    gestureMoved = false;
    stopGesture = () => finish({ type: 'pointercancel' });
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function startLasso(e) {
    const [startX, startY] = toStage(stagePoint(e));
    let box = null;
    root.classList.add('is-marking');
    const inside = () => formation.dancers
      .filter(d => {
        const [x, y] = toStage(currentStep().pos[d.id]);
        return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
      })
      .map(d => d.id);

    trackPointer(e, ev => {
      const [pointX, pointY] = toStage(stagePoint(ev));
      const x = clamp(pointX, 0, STAGE_W);
      const y = clamp(pointY, 0, STAGE_H);
      if (!box && Math.hypot(x - startX, y - startY) < GRID / 2) return;
      box = { left: Math.min(x, startX), right: Math.max(x, startX), top: Math.min(y, startY), bottom: Math.max(y, startY) };
      gestureMoved = true;
      lasso.setAttribute('x', box.left);
      lasso.setAttribute('y', box.top);
      lasso.setAttribute('width', box.right - box.left);
      lasso.setAttribute('height', box.bottom - box.top);
      lasso.classList.add('is-on');
      const covered = new Set(inside());
      layer.querySelectorAll('.dancer').forEach(group => group.classList.toggle('is-selected', covered.has(group.dataset.id)));
    }, cancelled => {
      root.classList.remove('is-marking');
      lasso.classList.remove('is-on');
      if (cancelled) {
        showPicked();
        return;
      }
      if (!box) {
        if (e.isPrimary && (selected || picked.size)) select(null);
        return;
      }
      const covered = inside();
      if (covered.length === 1) select(covered[0]);
      else setPicked(new Set(covered));
    });
  }

  function dragPicked(e, id) {
    const step = currentStep();
    const pos = step.pos;
    const before = { ...pos };
    const ids = [...picked];
    const groups = ids.map(other => layer.querySelector(`[data-id="${other}"]`));
    const starts = ids.map(other => toStage(pos[other]));
    const rest = formation.dancers.filter(d => !picked.has(d.id)).map(d => toStage(pos[d.id]));
    const xs = starts.map(([x]) => x);
    const ys = starts.map(([, y]) => y);
    const range = {
      left: Math.min(0, 0.04 * STAGE_W - Math.min(...xs)),
      right: Math.max(0, 0.96 * STAGE_W - Math.max(...xs)),
      up: Math.min(0, 0.07 * STAGE_H - Math.min(...ys)),
      down: Math.max(0, 0.9 * STAGE_H - Math.max(...ys)),
    };
    const shift = (value, low, high) => (state.formationSnap
      ? clamp(Math.round(value / GRID) * GRID, Math.ceil(low / GRID) * GRID, Math.floor(high / GRID) * GRID)
      : clamp(value, low, high));
    const [startX, startY] = toStage(stagePoint(e));
    let moved = false;
    groups.forEach(group => group.classList.add('is-dragging'));

    trackPointer(e, ev => {
      const [x, y] = toStage(stagePoint(ev));
      const threshold = state.formationSnap ? GRID / 2 : 8;
      if (!moved && Math.hypot(x - startX, y - startY) < threshold) return;
      const dx = shift(x - startX, range.left, range.right);
      const dy = shift(y - startY, range.up, range.down);
      if (!moved && dx === 0 && dy === 0) return;
      const spots = starts.map(([fromX, fromY]) => [fromX + dx, fromY + dy]);
      if (state.formationSnap && spots.some(spot => rest.some(other => apart(spot, other) < DANCER_WIDTH))) return;
      moved = true;
      gestureMoved = true;
      ids.forEach((other, i) => {
        pos[other] = fromStage(spots[i]);
        place(groups[i], pos[other]);
      });
    }, cancelled => {
      groups.forEach(group => group.classList.remove('is-dragging'));
      if (cancelled) {
        Object.assign(pos, before);
        ids.forEach((other, i) => place(groups[i], pos[other]));
        return;
      }
      if (moved) commitWithUndo(step, before);
      else select(id);
    });
  }

  root.addEventListener('pointerdown', e => {
    if (e.isPrimary || !gestureMoved) stopGesture?.();
  }, true);

  root.addEventListener('click', e => {
    if (!stopGesture) return;
    e.stopPropagation();
    e.preventDefault();
  }, true);

  stage.addEventListener('pointerdown', e => {
    if (stopGesture || playing() || e.button !== 0 || e.ctrlKey) return;
    const group = e.target.closest('.dancer');
    if (!group) {
      startLasso(e);
      return;
    }
    e.preventDefault();
    stage.classList.remove('is-gliding');
    const id = group.dataset.id;
    if (picked.has(id)) {
      dragPicked(e, id);
      return;
    }
    const pos = currentStep().pos;
    const [startX, startY] = stagePoint(e);
    const [fromX, fromY] = pos[id];
    const others = othersOf(id, pos);
    let moved = false;
    group.classList.add('is-dragging');

    trackPointer(e, ev => {
      const [x, y] = stagePoint(ev);
      const threshold = state.formationSnap ? GRID / 2 : 8;
      if (!moved && Math.hypot((x - startX) * STAGE_W, (y - startY) * STAGE_H) < threshold) return;
      const loose = [clamp(fromX + x - startX, 0.04, 0.96), clamp(fromY + y - startY, 0.07, 0.9)];
      const spot = state.formationSnap ? snapSpot(loose, others) : loose;
      if (!moved && apart(toStage(spot), toStage([fromX, fromY])) < 1) return;
      if (picked.size) setPicked(new Set());
      moved = true;
      gestureMoved = true;
      pos[id] = spot;
      place(group, pos[id]);
      if (state.formationSnap) showGuides(pos[id], others);
    }, cancelled => {
      group.classList.remove('is-dragging');
      hideGuides();
      if (cancelled) {
        pos[id] = [fromX, fromY];
        place(group, pos[id]);
        return;
      }
      if (moved) commit();
      else select(selected === id ? null : id);
    });
  });

  stage.addEventListener('keydown', e => {
    const group = e.target.closest('.dancer');
    if (!group || playing() || stopGesture) return;
    const id = group.dataset.id;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(selected === id ? null : id);
      return;
    }
    const nudge = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!nudge) return;
    e.preventDefault();
    stage.classList.remove('is-gliding');
    const pos = currentStep().pos;
    const [stepX, stepY] = state.formationSnap ? [GRID / STAGE_W, GRID / STAGE_H] : [0.02, 0.03];
    const loose = [clamp(pos[id][0] + nudge[0] * stepX, 0.04, 0.96), clamp(pos[id][1] + nudge[1] * stepY, 0.07, 0.9)];
    pos[id] = state.formationSnap ? snapSpot(loose, othersOf(id, pos)) : loose;
    place(group, pos[id]);
    commit();
  });

  tabs.addEventListener('click', e => {
    if (playing()) return;
    if (e.target.closest('[data-add-step]')) {
      if (formation.steps.length >= MAX_STEPS) return;
      const label = nextFree(new Set(formation.steps.map(step => step.label)), 'Bild ');
      const copy = { id: newId(), label, pos: JSON.parse(JSON.stringify(currentStep().pos)) };
      formation.steps.splice(stepIndex + 1, 0, copy);
      commit();
      showStep(stepIndex + 1, false);
      return;
    }
    const tab = e.target.closest('[data-step]');
    if (tab) showStep(Number(tab.dataset.step), true);
  });

  tools.addEventListener('click', e => {
    if (e.target.closest('[data-play]')) {
      if (playing()) stopPlaying();
      else play();
      return;
    }
    if (playing()) return;

    const toolTabButton = e.target.closest('[data-tool-tab]');
    if (toolTabButton) {
      toolTab = toolTabButton.dataset.toolTab;
      if (toolTab === 'formen') {
        selected = null;
        picked = new Set();
        showPicked();
      }
      renderTools();
      return;
    }

    const shapeButton = e.target.closest('[data-shape]');
    if (shapeButton) {
      applyShape(shapeButton.dataset.shape);
      return;
    }

    const mirrorButton = e.target.closest('[data-mirror]');
    if (mirrorButton) {
      mirrorStep(mirrorButton.dataset.mirror);
      return;
    }

    if (e.target.closest('[data-pick-all]')) {
      setPicked(new Set(formation.dancers.map(d => d.id)));
      return;
    }

    if (e.target.closest('[data-unpick]')) {
      select(null);
      return;
    }

    if (e.target.closest('[data-groups]')) {
      openGroups();
      return;
    }

    const quickGroup = e.target.closest('[data-use-group]');
    if (quickGroup) {
      const group = state.groups.find(g => g.id === quickGroup.dataset.useGroup);
      if (group) useGroup(group);
      return;
    }

    if (e.target.closest('[data-add-dancer]')) {
      if (formation.dancers.length >= MAX_DANCERS) return;
      const name = nextFree(new Set(formation.dancers.map(d => d.name)), '');
      const dancer = { id: newId(), name, flavor: FLAVORS[formation.dancers.length % FLAVORS.length] };
      formation.dancers.push(dancer);
      formation.steps.forEach(step => { step.pos[dancer.id] = freeSpot(step.pos); });
      selected = dancer.id;
      picked = new Set();
      commit();
      renderAll();
      pop(layer.querySelector(`[data-id="${dancer.id}"] .dancer-body`));
      return;
    }

    const flavorBtn = e.target.closest('[data-flavor]');
    if (flavorBtn) {
      const dancer = formation.dancers.find(d => d.id === selected);
      dancer.flavor = flavorBtn.dataset.flavor;
      commit();
      renderDancers();
      renderTools();
      return;
    }

    const removeDancer = e.target.closest('[data-remove-dancer]');
    if (removeDancer) {
      askFirst(removeDancer, ' Von der Bühne nehmen', () => {
        formation.dancers = formation.dancers.filter(d => d.id !== selected);
        formation.steps.forEach(step => { delete step.pos[selected]; });
        selected = null;
        commit();
        renderAll();
      });
      return;
    }

    const removeStep = e.target.closest('[data-remove-step]');
    if (removeStep) {
      askFirst(removeStep, ' Bild löschen', () => {
        formation.steps.splice(stepIndex, 1);
        stepIndex = Math.max(0, stepIndex - 1);
        commit();
        showStep(stepIndex, false);
      });
    }
  });

  tools.addEventListener('input', e => {
    if (playing()) return;
    if (e.target.name === 'dancerName') {
      const index = formation.dancers.findIndex(d => d.id === selected);
      if (index < 0) return;
      const dancer = formation.dancers[index];
      const typed = e.target.value.slice(0, 20);
      const others = new Set(formation.dancers.filter(d => d !== dancer).map(d => d.name));
      dancer.name = typed.trim() ? typed : nextFree(others, '');
      const group = layer.querySelector(`[data-id="${dancer.id}"]`);
      group.querySelector('.dancer-short').textContent = dancerShort(dancer.name);
      group.querySelector('.dancer-name')?.remove();
      if (hasLongName(dancer.name)) {
        group.insertAdjacentHTML('beforeend', `<text class="dancer-name" y="66" text-anchor="middle">${esc(dancer.name.trim())}</text>`);
      }
      renderGhosts();
      commit();
    }
    if (e.target.name === 'stepLabel') {
      const typed = e.target.value.slice(0, 30);
      currentStep().label = typed.trim() ? typed : `Bild ${stepIndex + 1}`;
      tabs.querySelector(`[data-step="${stepIndex}"]`).textContent = currentStep().label;
      commit();
    }
  });

  tools.addEventListener('change', e => {
    if (playing()) return;
    if (e.target.name === 'dancerName') {
      const dancer = formation.dancers.find(d => d.id === selected);
      if (dancer && !e.target.value.trim()) e.target.value = dancer.name;
    }
    if (e.target.name === 'stepLabel' && !e.target.value.trim()) e.target.value = currentStep().label;
  });

  root.querySelector('.stage-bar').addEventListener('click', e => {
    if (playing()) return;
    if (e.target.closest('[data-snap]')) {
      state.formationSnap = !state.formationSnap;
      save();
      renderStageBar();
      return;
    }
    const massButton = e.target.closest('[data-tidy], [data-undo]');
    if (!massButton || performance.now() - massTappedAt < 450) return;
    massTappedAt = performance.now();
    if (massButton.hasAttribute('data-tidy')) tidyStep();
    else undoStep();
  });

  ghostButton.addEventListener('click', () => {
    if (playing()) return;
    state.formationGhost = !state.formationGhost;
    save();
    renderGhosts();
  });

  function useGroup(group) {
    const names = new Set(formation.dancers.map(d => d.name.trim()));
    const missing = group.people.filter(person => !names.has(person.name.trim()));
    const adding = missing.slice(0, MAX_DANCERS - formation.dancers.length);
    adding.forEach(person => {
      const dancer = { id: newId(), name: person.name, flavor: person.flavor };
      formation.dancers.push(dancer);
      formation.steps.forEach(step => { step.pos[dancer.id] = freeSpot(step.pos); });
    });
    selected = null;
    picked = new Set();
    if (adding.length) commit();
    renderAll();
    if (adding.length < missing.length) toast(`Nur ${adding.length} kamen dazu, mehr als ${MAX_DANCERS} passen nicht auf die Bühne.`);
    else if (adding.length) toast(`${peopleCount(adding.length)} dazu.`);
    else toast('Alle aus der Gruppe stehen schon auf der Bühne.');
  }

  function openGroups() {
    const back = openSubSheet(`<div class="sheet-inner sheet-small groups-sheet">
      <header class="sheet-head">
        <h2 id="groups-title">Gruppen</h2>
        <button type="button" class="icon-btn" data-back aria-label="Zurück">${icon('close')}</button>
      </header>
      <div class="group-list"></div>
      <form class="group-save">
        <label class="field">
          <span>Diese ${peopleCount(formation.dancers.length)} als Gruppe speichern</span>
          <input name="groupName" maxlength="30" placeholder="z. B. Meine Garde" autocomplete="off">
        </label>
        <button type="submit" class="btn flavor-brause" ${formation.dancers.length ? '' : 'disabled'}>Speichern</button>
      </form>
    </div>`);
    const list = sheet.querySelector('.group-list');
    const renderList = () => {
      list.innerHTML = state.groups.length ? state.groups.map(group => `<div class="group-row">
        <p><strong>${esc(group.name)}</strong><span class="muted">${peopleCount(group.people.length)}</span></p>
        <div class="group-actions">
          <button type="button" class="btn btn-ghost btn-small" data-group-use="${group.id}">Einsetzen</button>
          <button type="button" class="btn btn-ghost btn-small btn-danger-text" data-group-delete="${group.id}">${icon('trash', 18)} Löschen</button>
        </div>
      </div>`).join('') : '<p class="muted">Noch keine Gruppe. Speichere hier deine Leute, dann stehen sie bei der nächsten Aufstellung mit einem Tipp auf der Bühne.</p>';
    };
    renderList();
    sheet.querySelector('[data-back]').addEventListener('click', () => {
      disarm?.();
      back();
      renderTools();
    });
    list.addEventListener('click', e => {
      const use = e.target.closest('[data-group-use]');
      if (use) {
        const group = state.groups.find(g => g.id === use.dataset.groupUse);
        disarm?.();
        back();
        renderTools();
        if (group) useGroup(group);
        return;
      }
      const remove = e.target.closest('[data-group-delete]');
      if (remove) {
        askFirst(remove, ' Löschen', () => {
          const previous = state.groups;
          state.groups = previous.filter(g => g.id !== remove.dataset.groupDelete);
          if (!save()) state.groups = previous;
          renderList();
        });
      }
    });
    const saveForm = sheet.querySelector('.group-save');
    const saveButton = saveForm.querySelector('button[type="submit"]');
    const storeGroup = name => {
      const people = formation.dancers.map(d => ({ name: d.name.trim(), flavor: d.flavor }));
      const previous = state.groups;
      const known = previous.find(g => g.name === name);
      state.groups = known
        ? previous.map(g => (g === known ? { ...g, people } : g))
        : [...previous, { id: newId(), name, people }];
      if (!save()) {
        state.groups = previous;
        return;
      }
      disarm?.();
      saveForm.elements.groupName.value = '';
      saveButton.disabled = true;
      renderList();
      toast(known ? `„${name}“ ist ersetzt.` : `„${name}“ ist gespeichert.`);
    };
    saveForm.elements.groupName.addEventListener('input', () => {
      disarm?.();
      saveButton.disabled = formation.dancers.length === 0;
    });
    saveForm.addEventListener('submit', e => {
      e.preventDefault();
      if (saveButton.disabled) return;
      const names = new Set(state.groups.map(g => g.name));
      const typed = saveForm.elements.groupName.value.trim().slice(0, 30);
      const name = typed || (names.has('Meine Gruppe') ? nextFree(names, 'Meine Gruppe ') : 'Meine Gruppe');
      if (names.has(name)) askFirst(saveButton, 'Speichern', () => storeGroup(name), `„${name}“ ersetzen?`);
      else storeGroup(name);
    });
  }

  function openShare() {
    let scope = 'all';
    let file = null;
    let url = null;
    let turn = 0;
    const many = formation.steps.length > 1;
    const back = openSubSheet(`<div class="sheet-inner sheet-wide share-sheet">
      <header class="sheet-head">
        <h2>Als Bild teilen</h2>
        <button type="button" class="icon-btn" data-back aria-label="Zurück">${icon('close')}</button>
      </header>
      ${many ? `<div class="filters" role="group" aria-label="Was aufs Bild soll">
        <button type="button" class="filter flavor-brause" data-scope="all" aria-pressed="true">Alle Bilder</button>
        <button type="button" class="filter flavor-brause" data-scope="one" aria-pressed="false">Nur „${esc(currentStep().label)}“</button>
      </div>` : ''}
      <div class="share-frame"><img class="share-preview" alt="Vorschau vom Bild"></div>
      <footer class="sheet-actions">
        <button type="button" class="btn flavor-brause" data-share disabled>${icon('share', 20)} Teilen</button>
      </footer>
    </div>`);
    const preview = sheet.querySelector('.share-preview');
    const send = sheet.querySelector('[data-share]');
    const build = async () => {
      turn += 1;
      const mine = turn;
      file = null;
      send.disabled = true;
      const blob = await formationImage(note, scope === 'all' ? formation.steps : [currentStep()]).catch(() => null);
      if (mine !== turn) return;
      if (!blob) {
        toast('Das Bild ließ sich nicht erstellen.');
        return;
      }
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(blob);
      preview.src = url;
      file = new File([blob], formationFileName(note), { type: 'image/png' });
      send.disabled = false;
    };
    sheet.querySelector('[data-back]').addEventListener('click', () => {
      turn += 1;
      if (url) URL.revokeObjectURL(url);
      back();
    });
    sheet.querySelectorAll('[data-scope]').forEach(button => button.addEventListener('click', () => {
      scope = button.dataset.scope;
      sheet.querySelectorAll('[data-scope]').forEach(other => other.setAttribute('aria-pressed', other === button));
      build();
    }));
    send.addEventListener('click', () => {
      if (!file) return;
      send.disabled = true;
      setTimeout(() => { send.disabled = !file; }, 1000);
      shareOrSave(file);
    });
    build();
  }

  shareButton.addEventListener('click', () => {
    if (!playing()) openShare();
  });

  copyButton.addEventListener('click', () => {
    if (playing() || performance.now() - openedAt < 450) return;
    const copy = copyOfFormation(note);
    state.notes.push(copy);
    if (!save()) {
      state.notes.pop();
      return;
    }
    changed = true;
    sheet.addEventListener('close', () => {
      openFormation(copy);
      toast(`Du bearbeitest jetzt „${copy.title}“.`);
    }, { once: true });
    closeSheet();
  });

  root.querySelector('.formation-title').addEventListener('input', e => {
    note.title = e.target.value.slice(0, 60);
    commit();
  });

  root.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const ok = await confirmSheet({
      title: 'Aufstellung löschen?',
      text: `„${note.title.trim() || 'Aufstellung'}“ mit allen Bildern ist danach weg.`,
      confirmLabel: 'Löschen',
    });
    if (!ok) return;
    state.notes = state.notes.filter(n => n.id !== note.id);
    save();
    rerender();
  });

  sheet.addEventListener('close', () => {
    stopGesture?.();
    clearTimeout(playTimer);
    clearTimeout(confirmTimer);
    playTimer = null;
    const title = note.title.trim();
    if (title !== note.title) {
      note.title = title;
      if (stored) save();
    }
    if (!existing && stored && !title && formation.dancers.length === 0 && state.notes.includes(note)) {
      state.notes = state.notes.filter(n => n !== note);
      save();
      changed = true;
    }
    if (changed && currentSection?.key === 'notizen') {
      if (state.notes.includes(note)) keepInView(note);
      rerender();
    }
  }, { once: true });

  renderAll();
}
