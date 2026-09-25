const STAGE_W = 1000;
const STAGE_H = 620;
const FRONT_FIRST = [3, 4, 2, 5, 1, 6, 0, 7];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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
    category: noteFilter === 'alle' ? 'training' : noteFilter,
    date: todayIso(),
    updatedAt: Date.now(),
    formation: { dancers: [], steps: [{ id: newId(), label: 'Bild 1', pos: {} }] },
  };
}

function peopleCount(n) {
  return `${n} ${n === 1 ? 'Person' : 'Leute'}`;
}

function stageFloor() {
  const lines = [0.25, 0.5, 0.75].map(f => `<path class="stage-grid" d="M${f * STAGE_W} 40V${STAGE_H - 40}"/>`).join('')
    + [1 / 3, 2 / 3].map(f => `<path class="stage-grid" d="M40 ${f * STAGE_H}H${STAGE_W - 40}"/>`).join('');
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

function freeSpot(pos) {
  const taken = Object.values(pos);
  for (let row = 0; row < 5; row++) {
    for (const col of FRONT_FIRST) {
      const spot = [0.14 + col * 0.103, 0.8 - row * 0.155];
      const clear = taken.every(([x, y]) => Math.hypot((x - spot[0]) * STAGE_W, (y - spot[1]) * STAGE_H) > 80);
      if (clear) return spot;
    }
  }
  return [0.5, 0.5];
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

  openSheet(`<div class="sheet-inner formation-editor">
    <header class="sheet-head">
      <input class="title-input formation-title" value="${esc(note.title)}" placeholder="Name der Aufstellung" aria-label="Name der Aufstellung" maxlength="60" autocomplete="off">
      <button type="button" class="icon-btn" data-close aria-label="Schließen">${icon('close')}</button>
    </header>
    <nav class="step-tabs" aria-label="Bilder"></nav>
    <div class="formation-body">
      <div class="stage-wrap">
        <svg class="stage" viewBox="0 0 ${STAGE_W} ${STAGE_H}" aria-label="Bühne, unten ist das Publikum">${stageFloor()}<g class="dancers"></g></svg>
        <p class="stage-front">Publikum</p>
        <div class="stage-empty">
          ${emptyArt('aufstellung')}
          <p>Noch niemand auf der Bühne. Tipp auf „Person dazu“.</p>
        </div>
      </div>
      <aside class="formation-tools"></aside>
    </div>
    <footer class="sheet-actions">
      ${existing ? `<button type="button" class="btn btn-ghost btn-danger-text" data-delete>${icon('trash', 20)} Löschen</button>` : ''}
      <button type="button" class="btn flavor-brause" data-close>Fertig</button>
    </footer>
  </div>`);

  const root = sheet.querySelector('.formation-editor');
  const stage = root.querySelector('.stage');
  const layer = root.querySelector('.dancers');
  const tabs = root.querySelector('.step-tabs');
  const tools = root.querySelector('.formation-tools');
  const currentStep = () => formation.steps[stepIndex];
  const playing = () => playTimer !== null;

  function commit() {
    note.updatedAt = Date.now();
    if (!stored) {
      state.notes.push(note);
      stored = true;
    }
    changed = true;
    save();
  }

  function place(group, [x, y]) {
    group.style.transform = `translate(${x * STAGE_W}px, ${y * STAGE_H}px)`;
  }

  function renderDancers() {
    const pos = currentStep().pos;
    layer.innerHTML = formation.dancers.map(d => `<g class="dancer flavor-${d.flavor} ${d.id === selected ? 'is-selected' : ''}" data-id="${d.id}" tabindex="0" role="button" aria-label="${esc(d.name || 'Ohne Namen')}, verschiebbar">
      <circle class="dancer-edge" cy="7" r="36"/>
      <circle class="dancer-body" r="36"/>
      <text class="dancer-short" y="12" text-anchor="middle">${esc(dancerShort(d.name))}</text>
      ${hasLongName(d.name) ? `<text class="dancer-name" y="66" text-anchor="middle">${esc(d.name.trim())}</text>` : ''}
    </g>`).join('');
    layer.querySelectorAll('.dancer').forEach(group => place(group, pos[group.dataset.id] || [0.5, 0.5]));
    root.classList.toggle('is-empty', formation.dancers.length === 0);
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

  function renderTools() {
    const dancer = formation.dancers.find(d => d.id === selected);
    tools.innerHTML = `
      <button type="button" class="btn flavor-brause" data-add-dancer ${formation.dancers.length >= MAX_DANCERS || playing() ? 'disabled' : ''}>${icon('plus')} Person dazu</button>
      ${dancer ? `<section class="tool-block">
        <label class="field">
          <span>Name</span>
          <input name="dancerName" value="${esc(dancer.name)}" maxlength="20" autocomplete="off">
        </label>
        <div class="flavor-pick" role="group" aria-label="Farbe">
          ${FLAVORS.map(flavor => `<button type="button" class="flavor-dot flavor-${flavor}" data-flavor="${flavor}" aria-pressed="${dancer.flavor === flavor}" aria-label="${flavor}"></button>`).join('')}
        </div>
        <button type="button" class="btn btn-ghost btn-small btn-danger-text" data-remove-dancer>${icon('trash', 18)} Von der Bühne nehmen</button>
      </section>` : `<p class="muted tool-hint">Zieh die Punkte an ihre Plätze. Tipp einen Punkt an, um ihn umzubenennen oder die Farbe zu ändern.</p>`}
      <section class="tool-block">
        <label class="field">
          <span>Name vom Bild</span>
          <input name="stepLabel" value="${esc(currentStep().label)}" maxlength="30" autocomplete="off" ${playing() ? 'disabled' : ''}>
        </label>
        ${formation.steps.length > 1 ? `<button type="button" class="btn btn-ghost btn-small btn-danger-text" data-remove-step>${icon('trash', 18)} Bild löschen</button>` : ''}
      </section>
      <button type="button" class="btn btn-big flavor-himbeer play-btn" data-play ${formation.steps.length < 2 || formation.dancers.length === 0 ? 'disabled' : ''}>
        ${playing() ? `${icon('stop', 20)} Stopp` : `${icon('play', 20)} Abspielen`}
      </button>`;
  }

  function renderAll() {
    renderTabs();
    renderDancers();
    renderTools();
  }

  function showStep(i, animate) {
    stepIndex = i;
    stage.classList.toggle('is-gliding', animate && !reducedMotion());
    const pos = currentStep().pos;
    layer.querySelectorAll('.dancer').forEach(group => place(group, pos[group.dataset.id] || [0.5, 0.5]));
    renderTabs();
    if (!playing()) renderTools();
  }

  function stopPlaying() {
    clearTimeout(playTimer);
    playTimer = null;
    root.classList.remove('is-playing');
    renderTools();
  }

  function play() {
    selected = null;
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

  function select(id) {
    selected = id;
    layer.querySelectorAll('.dancer').forEach(group => group.classList.toggle('is-selected', group.dataset.id === id));
    renderTools();
  }

  function stagePoint(e) {
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(stage.getScreenCTM().inverse());
    return [point.x / STAGE_W, point.y / STAGE_H];
  }

  stage.addEventListener('pointerdown', e => {
    const group = e.target.closest('.dancer');
    if (!group) {
      if (selected) select(null);
      return;
    }
    if (playing() || e.button !== 0 || e.ctrlKey) return;
    e.preventDefault();
    stage.classList.remove('is-gliding');
    const id = group.dataset.id;
    const pos = currentStep().pos;
    const [startX, startY] = stagePoint(e);
    const [fromX, fromY] = pos[id];
    let moved = false;
    group.classList.add('is-dragging');

    const move = ev => {
      if (ev.pointerId !== e.pointerId) return;
      if (ev.pointerType === 'mouse' && ev.buttons === 0) {
        end(ev);
        return;
      }
      const [x, y] = stagePoint(ev);
      if (!moved && Math.hypot((x - startX) * STAGE_W, (y - startY) * STAGE_H) < 8) return;
      moved = true;
      pos[id] = [clamp(fromX + x - startX, 0.04, 0.96), clamp(fromY + y - startY, 0.07, 0.9)];
      place(group, pos[id]);
    };
    const end = ev => {
      if (ev.pointerId !== e.pointerId) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      group.classList.remove('is-dragging');
      if (moved) commit();
      else select(selected === id ? null : id);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  });

  stage.addEventListener('keydown', e => {
    const group = e.target.closest('.dancer');
    if (!group || playing()) return;
    const id = group.dataset.id;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(selected === id ? null : id);
      return;
    }
    const nudge = { ArrowLeft: [-0.02, 0], ArrowRight: [0.02, 0], ArrowUp: [0, -0.03], ArrowDown: [0, 0.03] }[e.key];
    if (!nudge) return;
    e.preventDefault();
    const pos = currentStep().pos;
    pos[id] = [clamp(pos[id][0] + nudge[0], 0.04, 0.96), clamp(pos[id][1] + nudge[1], 0.07, 0.9)];
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

    if (e.target.closest('[data-add-dancer]')) {
      if (formation.dancers.length >= MAX_DANCERS) return;
      const name = nextFree(new Set(formation.dancers.map(d => d.name)), '');
      const dancer = { id: newId(), name, flavor: FLAVORS[formation.dancers.length % FLAVORS.length] };
      formation.dancers.push(dancer);
      formation.steps.forEach(step => { step.pos[dancer.id] = freeSpot(step.pos); });
      selected = dancer.id;
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

    if (e.target.closest('[data-remove-dancer]')) {
      formation.dancers = formation.dancers.filter(d => d.id !== selected);
      formation.steps.forEach(step => { delete step.pos[selected]; });
      selected = null;
      commit();
      renderAll();
      return;
    }

    const removeStep = e.target.closest('[data-remove-step]');
    if (removeStep) {
      if (!removeStep.classList.contains('is-asking')) {
        removeStep.classList.add('is-asking');
        removeStep.lastChild.textContent = ' Wirklich löschen?';
        armedAt = performance.now();
        clearTimeout(confirmTimer);
        confirmTimer = setTimeout(() => {
          if (!removeStep.isConnected) return;
          removeStep.classList.remove('is-asking');
          removeStep.lastChild.textContent = ' Bild löschen';
        }, 3000);
        return;
      }
      if (performance.now() - armedAt < 450) return;
      clearTimeout(confirmTimer);
      formation.steps.splice(stepIndex, 1);
      commit();
      showStep(Math.max(0, stepIndex - 1), false);
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
    if (changed && currentSection?.key === 'notizen') rerender();
  }, { once: true });

  renderAll();
}
