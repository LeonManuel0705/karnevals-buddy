const IMAGE_WIDTH = 1480;
const IMAGE_MARGIN = 40;
const IMAGE_GAP = 20;

const imageColor = name => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function fittedFont(ctx, text, weight, size, family, room) {
  ctx.font = `${weight} ${size}px ${family}`;
  const width = ctx.measureText(text).width;
  if (width <= room) return;
  ctx.font = `${weight} ${Math.max(14, (size * room) / width)}px ${family}`;
}

function drawStage(ctx, formation, step, x, y, width) {
  const scale = width / STAGE_W;
  const display = imageColor('display');
  const body = imageColor('body');
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = imageColor('veilchen');
  roundedRect(ctx, 6, 14, STAGE_W - 12, STAGE_H - 20, 56);
  ctx.fill();
  ctx.fillStyle = imageColor('veilchen-light');
  roundedRect(ctx, 6, 6, STAGE_W - 12, STAGE_H - 20, 56);
  ctx.fill();

  ctx.strokeStyle = imageColor('veilchen-deep');
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.setLineDash([2, 14]);
  ctx.beginPath();
  [260, 500, 740].forEach(lineX => {
    ctx.moveTo(lineX, 40);
    ctx.lineTo(lineX, STAGE_H - 40);
  });
  [190, 430].forEach(lineY => {
    ctx.moveTo(40, lineY);
    ctx.lineTo(STAGE_W - 40, lineY);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  formation.dancers.forEach(dancer => {
    const [dotX, dotY] = toStage(step.pos[dancer.id] || [0.5, 0.5]);
    ctx.fillStyle = imageColor(`${dancer.flavor}-deep`);
    ctx.beginPath();
    ctx.arc(dotX, dotY + 7, 36, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = imageColor(dancer.flavor);
    ctx.strokeStyle = imageColor('paper');
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 36, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = imageColor('ink');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `400 34px ${display}`;
    ctx.fillText(dancerShort(dancer.name), dotX, dotY + 12);
    if (hasLongName(dancer.name)) {
      ctx.font = `800 24px ${body}`;
      ctx.strokeStyle = imageColor('veilchen-light');
      ctx.lineWidth = 8;
      ctx.lineJoin = 'round';
      const half = ctx.measureText(dancer.name.trim()).width / 2 + 10;
      const nameX = clamp(dotX, Math.min(half, STAGE_W / 2), Math.max(STAGE_W - half, STAGE_W / 2));
      ctx.strokeText(dancer.name.trim(), nameX, dotY + 66);
      ctx.fillText(dancer.name.trim(), nameX, dotY + 66);
    }
  });
  ctx.restore();
}

async function formationImage(note, steps) {
  const display = imageColor('display');
  const body = imageColor('body');
  await Promise.race([
    Promise.all(['400 34px "Titan One"', '800 24px "M PLUS Rounded 1c"', '700 24px "M PLUS Rounded 1c"']
      .map(font => document.fonts?.load(font, 'AaÄöü1').catch(() => null))),
    new Promise(resolve => { setTimeout(resolve, 1500); }),
  ]);

  const columns = steps.length === 1 ? 1 : (steps.length <= 8 ? 2 : 3);
  const rows = Math.ceil(steps.length / columns);
  const inner = IMAGE_WIDTH - 2 * IMAGE_MARGIN;
  const cellWidth = (inner - (columns - 1) * IMAGE_GAP) / columns;
  const stageHeight = (cellWidth * (STAGE_H + 8)) / STAGE_W;
  const labelHeight = steps.length > 1 ? 52 : 0;
  const frontHeight = 40;
  const cellHeight = labelHeight + stageHeight + frontHeight;
  const titleHeight = 96;
  const height = 2 * IMAGE_MARGIN + titleHeight + rows * cellHeight + (rows - 1) * IMAGE_GAP;

  const canvas = document.createElement('canvas');
  canvas.width = IMAGE_WIDTH;
  canvas.height = Math.ceil(height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = imageColor('ground');
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const title = note.title.trim() || 'Aufstellung';
  ctx.fillStyle = imageColor('ink');
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  fittedFont(ctx, title, 400, 60, display, inner);
  ctx.fillText(title, IMAGE_MARGIN, IMAGE_MARGIN + 60);

  steps.forEach((step, i) => {
    const x = IMAGE_MARGIN + (i % columns) * (cellWidth + IMAGE_GAP);
    const y = IMAGE_MARGIN + titleHeight + Math.floor(i / columns) * (cellHeight + IMAGE_GAP);
    if (labelHeight) {
      ctx.fillStyle = imageColor('ink');
      ctx.textAlign = 'left';
      fittedFont(ctx, step.label, 800, 30, body, cellWidth);
      ctx.fillText(step.label, x + 6, y + 36);
    }
    drawStage(ctx, note.formation, step, x, y + labelHeight, cellWidth);
    ctx.fillStyle = imageColor('ink-soft');
    ctx.textAlign = 'center';
    ctx.font = `800 ${columns === 1 ? 26 : 20}px ${body}`;
    ctx.fillText('Publikum', x + cellWidth / 2, y + labelHeight + stageHeight + 28);
  });

  return new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png');
  });
}

function formationFileName(note) {
  const slug = (note.title.trim() || 'Aufstellung')
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'aufstellung'}.png`;
}
