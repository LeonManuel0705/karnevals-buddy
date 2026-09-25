const sheet = document.getElementById('sheet');
const burstCanvas = document.getElementById('burst');
const FLAVOR_COLORS = ['#f4a3c0', '#fae27c', '#a8e0b8', '#c9b3f2', '#9fd3f2'];
const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)';
const isHomeScreenApp = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
const isAppleTouch = /iPad|iPhone/.test(navigator.userAgent)
  || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
let sheetDirty = false;

function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function reducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function wrapperEnd(side) {
  return `<svg class="end end-${side}" viewBox="0 0 60 120" aria-hidden="true">
    <path class="end-paper" d="M0 49Q6 51 10 54L58 6L51 17L60 27L51 38L60 49L51 60L60 71L51 82L60 93L51 104L58 114L10 66Q6 69 0 71Z"/>
    <path class="end-folds" d="M15 56L50 20M15 60H53M15 64L50 100"/>
    <path class="end-neck" d="M-2 45Q7 47 13 53L13 67Q7 73 -2 75Z"/>
    <path class="end-twist" d="M2 49L8 71M8 51L12 66"/>
  </svg>`;
}

function miniCandy(flavor, attrs = '') {
  return `<svg class="mini flavor-${flavor}" viewBox="-40 -18 80 36" aria-hidden="true" ${attrs}>
    <path class="end-paper" d="M-12 0L-34 -14L-30 -5L-37 0L-30 5L-34 14Z"/>
    <path class="end-paper" d="M12 0L34 -14L30 -5L37 0L30 5L34 14Z"/>
    <ellipse class="end-paper" rx="17" ry="13"/>
    <rect x="-9" y="-8" width="10" height="4" rx="2" fill="#fff" opacity=".7"/>
  </svg>`;
}

function stick(done, total, label) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `<span class="stick" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}">
    <span class="stick-fill" style="--p:${pct}%"></span>
  </span>`;
}

function setStick(el, done, total) {
  if (!el) return;
  el.setAttribute('aria-valuenow', done);
  el.setAttribute('aria-valuemax', total);
  el.querySelector('.stick-fill').style.setProperty('--p', `${total ? Math.round((done / total) * 100) : 0}%`);
}

function pop(el) {
  if (!el || reducedMotion()) return;
  el.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(.78)' }, { transform: 'scale(1.14)' }, { transform: 'scale(1)' }],
    { duration: 420, easing: 'ease-out' },
  );
}

function markEmptyDates() {
  sheet.querySelectorAll('input[type=date], input[type=time]').forEach(input => {
    input.classList.toggle('is-empty', !input.value);
  });
}

function openSheet(html) {
  sheet.innerHTML = html;
  sheetDirty = false;
  markEmptyDates();
  if (!sheet.open) sheet.showModal();
  if (!reducedMotion()) {
    sheet.animate(
      [{ opacity: 0, transform: 'translateY(28px) scale(.97)' }, { opacity: 1, transform: 'none' }],
      { duration: 380, easing: EASE_OUT },
    );
  }
  sheet.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeSheet));
  if (typeof watchArt === 'function') watchArt();
  return sheet;
}

function closeSheet() {
  if (sheet.open) sheet.close();
}

sheet.addEventListener('input', () => {
  sheetDirty = true;
  markEmptyDates();
});

let pressedBackdrop = false;
sheet.addEventListener('pointerdown', e => {
  pressedBackdrop = e.target === sheet;
});

sheet.addEventListener('click', e => {
  if (e.target !== sheet || sheetDirty || !pressedBackdrop) return;
  const box = sheet.getBoundingClientRect();
  const outside = e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom;
  if (outside) closeSheet();
});

sheet.addEventListener('cancel', e => {
  if (sheetDirty) e.preventDefault();
});

function confirmSheet({ title, text, confirmLabel }) {
  return new Promise(resolve => {
    const previous = sheet.open ? [...sheet.childNodes] : null;
    const previousDirty = sheetDirty;
    const onClose = () => resolve(false);
    openSheet(`<div class="sheet-inner sheet-small" role="alertdialog" aria-labelledby="confirm-title">
      <h2 id="confirm-title">${esc(title)}</h2>
      <p class="muted">${esc(text)}</p>
      <div class="sheet-actions">
        <button type="button" class="btn btn-ghost" data-answer="no">Lieber nicht</button>
        <button type="button" class="btn btn-danger" data-answer="yes">${esc(confirmLabel)}</button>
      </div>
    </div>`);
    sheet.addEventListener('close', onClose, { once: true });
    sheet.querySelectorAll('[data-answer]').forEach(btn => btn.addEventListener('click', () => {
      const yes = btn.dataset.answer === 'yes';
      resolve(yes);
      if (!yes && previous) {
        sheet.removeEventListener('close', onClose);
        sheet.replaceChildren(...previous);
        sheetDirty = previousDirty;
      } else {
        closeSheet();
      }
    }));
  });
}

function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = text;
  (sheet.open ? sheet : document.body).append(el);
  setTimeout(() => el.classList.add('is-leaving'), 2600);
  setTimeout(() => el.remove(), 3000);
}

function drawCandy(ctx, piece, alpha) {
  const s = piece.size;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(piece.x, piece.y);
  ctx.rotate(piece.rot);
  ctx.fillStyle = piece.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.75, 0, 0, Math.PI * 2);
  ctx.moveTo(-s * 0.7, 0);
  ctx.lineTo(-s * 1.9, -s * 0.8);
  ctx.lineTo(-s * 1.9, s * 0.8);
  ctx.closePath();
  ctx.moveTo(s * 0.7, 0);
  ctx.lineTo(s * 1.9, -s * 0.8);
  ctx.lineTo(s * 1.9, s * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.fillRect(-s * 0.45, -s * 0.45, s * 0.5, s * 0.22);
  ctx.restore();
}

function candyBurst(fromEl) {
  if (!fromEl || reducedMotion()) return;
  const ctx = burstCanvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  burstCanvas.width = innerWidth * dpr;
  burstCanvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const rect = fromEl.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const pieces = Array.from({ length: 42 }, (_, i) => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
    const speed = 6 + Math.random() * 8;
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      size: 5 + Math.random() * 4,
      color: FLAVOR_COLORS[i % FLAVOR_COLORS.length],
    };
  });

  const duration = 1500;
  const started = performance.now();
  let last = started;
  function frame(now) {
    const step = Math.min(3, (now - last) / 16.7);
    last = now;
    const age = now - started;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of pieces) {
      p.vy += 0.38 * step;
      p.vx *= 0.99;
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.rot += p.spin * step;
      drawCandy(ctx, p, Math.min(1, 2.2 * (1 - age / duration)));
    }
    if (age < duration) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  requestAnimationFrame(frame);
}
