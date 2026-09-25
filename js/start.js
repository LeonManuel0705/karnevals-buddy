const COUNTDOWN_UNITS = [
  ['days', 'Tage', 'Tag'],
  ['hours', 'Stunden', 'Stunde'],
  ['minutes', 'Minuten', 'Minute'],
  ['seconds', 'Sekunden', 'Sekunde'],
];

let toss = null;
let slipTask = null;

function missingText(items, labelFor) {
  const open = items.filter(item => !item.done).map(labelFor);
  return `Fehlt: ${open.map(esc).join(', ')}`;
}

function packingLine(items) {
  const done = countDone(items);
  if (!items.length) return 'Die Liste ist leer';
  if (done === items.length) return 'Alles drin, die Tasche kann zu';
  if (done === 0) return 'Noch nichts eingepackt';
  return `${done} von ${items.length} eingepackt`;
}

function heroMeta(ev, start) {
  if (!ev) {
    return [`${icon('calendar', 20)} ${longDate.format(start)}`, `${icon('clock', 20)} 11:11 Uhr`];
  }
  return [
    `${icon('calendar', 20)} ${longDate.format(eventStart(ev))}`,
    ev.meetTime && `${icon('users', 20)} Treffen ${ev.meetTime} Uhr`,
    `${icon('clock', 20)} ${ev.meetTime && ev.time ? `Beginn ${formatTime(ev)}` : formatTime(ev)}`,
    ev.place && `${icon('pin', 20)} ${esc(ev.place)}`,
    ev.people && `${icon('users', 20)} ${esc(ev.people)}`,
  ].filter(Boolean);
}

function heroBonbon(ev, target) {
  const flavor = ev ? EVENT_TYPES[ev.type].flavor : 'veilchen';
  const started = target.start <= new Date();
  return `<article class="bonbon bonbon-hero flavor-${flavor}">
    ${wrapperEnd('left')}
    <div class="bonbon-body">
      ${ev ? `<span class="tag hero-tag">${EVENT_TYPES[ev.type].label}</span>` : ''}
      <h2 class="hero-title">${esc(target.name)}</h2>
      <ul class="meta">${heroMeta(ev, target.start).map(item => `<li>${item}</li>`).join('')}</ul>
      ${started
        ? `<p class="countdown-now">${ev && !ev.time ? 'Heute ist es so weit. Helau!' : 'Es geht los. Helau!'}</p>`
        : `<div class="countdown" role="timer" aria-label="Countdown ${target.caption || ''}">
            ${COUNTDOWN_UNITS.map(([unit]) => `<div class="cd-part">
              <span class="cd-num" data-unit="${unit}">0</span>
              <span class="cd-label" data-label="${unit}"></span>
            </div>`).join('')}
          </div>
          ${target.caption ? `<p class="cd-caption">${target.caption}</p>` : ''}`}
    </div>
    ${wrapperEnd('right')}
  </article>`;
}

function stickRow({ flavor, href, title, text, done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `<a class="stick-row flavor-${flavor}" href="${href}">
    <span class="stick-row-fill" style="--p:${pct}%"></span>
    <span class="stick-row-text">
      <strong>${title}</strong>
      <span>${text}</span>
    </span>
    ${total ? `<span class="stick-row-count" aria-label="${done} von ${total} fertig">${done}/${total}</span>` : ''}
  </a>`;
}

function readiness(ev) {
  const costume = findCostume(ev.costumeId);
  let costumeText = 'Noch keins ausgesucht';
  if (costume && !costume.parts.length) costumeText = 'Noch keine Teile eingetragen';
  else if (costume && isComplete(costume.parts)) costumeText = 'Alles fertig';
  else if (costume) costumeText = missingText(costume.parts, part => part.label);

  const done = countDone(ev.packing);
  let bagText = missingText(ev.packing, item => item.label);
  if (!ev.packing.length) bagText = 'Die Liste ist leer';
  else if (isComplete(ev.packing)) bagText = 'Alles drin, die Tasche kann zu';
  else if (done === 0) bagText = 'Noch nichts eingepackt';

  return `<div class="ready">
    ${stickRow({
      flavor: 'veilchen',
      href: costume ? `#kostuem/${costume.id}` : `#termine/${ev.id}`,
      title: costume ? esc(costume.name) : 'Kostüm',
      text: costumeText,
      done: costume ? countDone(costume.parts) : 0,
      total: costume ? costume.parts.length : 0,
    })}
    ${stickRow({
      flavor: 'waldmeister',
      href: `#packliste/${ev.id}`,
      title: 'Tasche',
      text: bagText,
      done,
      total: ev.packing.length,
    })}
  </div>`;
}

function laterEvents(list) {
  if (!list.length) return '';
  return `<section class="later">
    <h3>Danach</h3>
    <ul>${list.map(ev => {
      const start = eventStart(ev);
      return `<li><a class="bonbon later-bonbon flavor-${EVENT_TYPES[ev.type].flavor}" href="#termine/${ev.id}">
        ${wrapperEnd('left')}
        <span class="bonbon-body">
          <span class="date-chip"><b>${start.getDate()}</b><small>${shortMonth.format(start)}</small></span>
          <span class="later-text">
            <span class="later-name">${esc(ev.name)}</span>
            <span class="later-when">${relativeDay(start)}</span>
          </span>
        </span>
        ${wrapperEnd('right')}
      </a></li>`;
    }).join('')}</ul>
  </section>`;
}

function emptyStart() {
  return `<div class="start-empty">
    <p>Noch kein Termin drin. Solange läuft der Countdown bis zum nächsten großen Karnevalstag.</p>
    <a class="btn flavor-zitrone" href="#termine/neu">${icon('plus')} Ersten Termin eintragen</a>
  </div>`;
}

const BAG_SVG = `<svg class="bag" viewBox="-14 40 268 236" aria-hidden="true">
  <path class="bag-inside" d="M46 110V84L60 75L74 84L90 73L106 83L122 72L138 82L154 73L170 83L184 74L194 83V110Z"/>
  <g transform="translate(78 86) rotate(-22)">${miniCandy('zitrone', 'x="-40" y="-18" width="80" height="36"')}</g>
  <g transform="translate(160 84) rotate(26)">${miniCandy('waldmeister', 'x="-40" y="-18" width="80" height="36"')}</g>
  <g transform="translate(120 74) rotate(8)">${miniCandy('brause', 'x="-40" y="-18" width="80" height="36"')}</g>
  <path class="bag-front" d="M38 102L52 93L66 102L82 92L98 101L114 91L130 101L146 92L162 101L178 92L202 102L206 250Q206 258 198 258H42Q34 258 34 250Z"/>
  <path class="bag-gusset" d="M38 102L56 116L54 258H42Q34 258 34 250Z"/>
  <path class="bag-gusset" d="M202 102L184 116L186 258H198Q206 258 206 250Z"/>
  <path class="bag-crease" d="M76 138L92 144M150 222L138 232M112 228L124 236M160 132L170 128"/>
  <g transform="rotate(-5 120 180)">
    <rect class="bag-label" x="62" y="157" width="116" height="46" rx="23"/>
    <text class="bag-text" x="120" y="187" text-anchor="middle">Kamelle</text>
  </g>
  <g transform="translate(16 254) rotate(-28)">${miniCandy('veilchen', 'x="-32" y="-14" width="64" height="29"')}</g>
  <g transform="translate(226 256) rotate(18)">${miniCandy('zitrone', 'x="-32" y="-14" width="64" height="29"')}</g>
</svg>`;

function bagPanel() {
  return `<aside class="bag-panel" aria-label="Überrasch mich">
    <div class="bag-stage">
      ${BAG_SVG}
      <div class="slip" hidden>
        <p class="slip-task" aria-live="polite"></p>
        <div class="slip-actions">
          <button type="button" class="btn btn-ghost" data-slip="again">Noch eine</button>
          <button type="button" class="btn flavor-himbeer" data-slip="ok">Mach ich</button>
        </div>
      </div>
    </div>
    <div class="bag-cta">
      <button type="button" class="btn btn-big flavor-himbeer" data-action="surprise">Überrasch mich</button>
      <p class="muted small">Greif in die Tüte, wenn du nicht weißt, was als Nächstes dran ist.</p>
    </div>
  </aside>`;
}

function stopToss(stage) {
  toss?.cancel();
  toss = null;
  stage.querySelector('.flying')?.remove();
}

function revealSlip(stage, task) {
  const slip = stage.querySelector('.slip');
  slip.querySelector('.slip-task').textContent = task;
  stage.classList.add('has-slip');
  slip.hidden = false;
  if (reducedMotion()) return;
  slip.animate(
    [
      { transform: 'scale(.18, .3) rotate(-14deg)', opacity: 0 },
      { transform: 'scale(.5, .42) rotate(6deg)', opacity: 1, offset: 0.3 },
      { transform: 'scale(1.05, 1) rotate(-1.5deg)', offset: 0.72 },
      { transform: 'none' },
    ],
    { duration: 620, easing: EASE_OUT },
  );
  slip.querySelector('.slip-task').animate(
    [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
    { duration: 300, delay: 260, easing: EASE_OUT, fill: 'backwards' },
  );
}

function showSlip(panel) {
  const stage = panel.querySelector('.bag-stage');
  const task = pickSurprise();
  slipTask = task;
  stopToss(stage);
  if (reducedMotion()) return revealSlip(stage, task);

  stage.querySelector('.slip').hidden = true;
  stage.classList.remove('has-slip');

  const flavors = ['zitrone', 'brause', 'waldmeister', 'veilchen'];
  const flying = document.createElement('div');
  flying.className = 'flying';
  flying.innerHTML = miniCandy(flavors[Math.floor(Math.random() * flavors.length)]);
  stage.append(flying);

  stage.querySelector('.bag').animate(
    [
      { transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(6deg)' },
      { transform: 'rotate(-3deg)' }, { transform: 'rotate(0)' },
    ],
    { duration: 480, easing: 'ease-in-out' },
  );

  toss = flying.animate(
    [
      { transform: 'translate(-50%, 0) scale(.6) rotate(0)', opacity: 0 },
      { transform: 'translate(-50%, -70px) scale(1.2) rotate(200deg)', opacity: 1, offset: 0.6 },
      { transform: 'translate(-50%, -20px) scale(1.5) rotate(360deg)', opacity: 1 },
    ],
    { duration: 520, delay: 180, easing: EASE_OUT, fill: 'forwards' },
  );
  toss.onfinish = () => {
    toss = null;
    flying.remove();
    revealSlip(stage, task);
  };
}

function hideSlip(panel) {
  slipTask = null;
  const stage = panel.querySelector('.bag-stage');
  const slip = stage.querySelector('.slip');
  stopToss(stage);
  const done = () => {
    slip.hidden = true;
    stage.classList.remove('has-slip');
  };
  if (reducedMotion()) return done();
  slip.animate(
    [{ transform: 'none', opacity: 1 }, { transform: 'scale(.3, .4) rotate(10deg)', opacity: 0 }],
    { duration: 240, easing: 'ease-in' },
  ).onfinish = done;
}

function tickCountdown(root, target) {
  const parts = countdownParts(target);
  root.classList.toggle('is-long', parts.days >= 100);
  for (const [unit, plural, singular] of COUNTDOWN_UNITS) {
    const value = parts[unit];
    const num = root.querySelector(`[data-unit="${unit}"]`);
    const label = root.querySelector(`[data-label="${unit}"]`);
    const text = unit === 'days' ? String(value) : String(value).padStart(2, '0');
    const word = value === 1 ? singular : plural;
    if (num.textContent !== text) num.textContent = text;
    if (label.textContent !== word) label.textContent = word;
  }
  return target - new Date() > 0;
}

function renderStart(root) {
  const now = new Date();
  const upcoming = upcomingEvents(now);
  const next = currentEvent(upcoming, now);
  const later = upcoming.filter(ev => ev !== next && effectiveStart(ev) > now).slice(0, 3);
  let target = nextSeasonDate(now);
  if (next) {
    const meet = meetStart(next);
    target = meet && meet > now
      ? { name: next.name, start: meet, caption: 'bis zum Treffen' }
      : { name: next.name, start: eventStart(next), caption: meet ? 'bis zum Beginn' : '' };
  }

  root.innerHTML = `
    <header class="page-head">
      <div>
        <h1>Helau${state.name ? `, ${esc(state.name)}` : ''}!</h1>
        <p class="page-sub">${longDate.format(now)}</p>
      </div>
      ${state.name ? '' : '<button type="button" class="btn btn-ghost btn-small name-hint" data-action="name">Name eintragen</button>'}
      <button type="button" class="icon-btn only-phone" data-action="settings" aria-label="Einstellungen">${icon('settings')}</button>
    </header>
    ${isAppleTouch && !isHomeScreenApp ? `<p class="install-note">
      Leg den Buddy zuerst auf den Home-Bildschirm (Teilen, dann „Zum Home-Bildschirm“) und öffne ihn dort einmal mit Internet.
      Was du hier in Safari einträgst, taucht in der App auf dem Home-Bildschirm nicht auf.
    </p>` : ''}
    <div class="start-grid">
      <div class="start-hero">${heroBonbon(next, target)}</div>
      <div class="start-ready">${next ? readiness(next) : emptyStart()}</div>
      ${bagPanel()}
      <div class="start-later">${laterEvents(later)}</div>
    </div>`;

  const panel = root.querySelector('.bag-panel');
  panel.querySelector('[data-action="surprise"]').addEventListener('click', () => showSlip(panel));
  panel.querySelector('[data-slip="again"]').addEventListener('click', () => showSlip(panel));
  panel.querySelector('[data-slip="ok"]').addEventListener('click', () => hideSlip(panel));
  root.querySelector('[data-action="settings"]').addEventListener('click', openSettings);
  root.querySelector('[data-action="name"]')?.addEventListener('click', () => {
    openSettings();
    sheet.querySelector('input[name="name"]').focus();
  });

  if (slipTask) {
    const stage = panel.querySelector('.bag-stage');
    const slip = stage.querySelector('.slip');
    slip.querySelector('.slip-task').textContent = slipTask;
    stage.classList.add('has-slip');
    slip.hidden = false;
  }

  const wakeAt = [new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime()];
  if (next && eventStart(next) <= now) {
    wakeAt.push(eventEnd(next));
    if (later[0]) wakeAt.push(eventStart(later[0]).getTime());
  }
  const ahead = upcoming.find(ev => eventStart(ev) > now);
  const aheadMeet = ahead && meetStart(ahead);
  if (aheadMeet && aheadMeet.getTime() - MEET_LEAD > now.getTime()) wakeAt.push(aheadMeet.getTime() - MEET_LEAD);
  const nextMeet = next && meetStart(next);
  if (nextMeet && nextMeet > now) wakeAt.push(nextMeet.getTime());
  const wake = setTimeout(rerender, Math.max(1000, Math.min(...wakeAt) - now.getTime()));

  const countdown = root.querySelector('.countdown');
  let timer = null;
  if (countdown) {
    tickCountdown(countdown, target.start);
    timer = setInterval(() => {
      if (document.hidden) return;
      if (!tickCountdown(countdown, target.start)) {
        clearInterval(timer);
        rerender();
      }
    }, 1000);
  }
  return () => {
    clearTimeout(wake);
    clearInterval(timer);
  };
}
