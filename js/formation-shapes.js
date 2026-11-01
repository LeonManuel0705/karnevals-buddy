const ROW_LIMIT = 12;

const fitGap = (preferred, room, parts, unit) => Math.max(
  2 * GRID,
  Math.floor(Math.min(preferred, parts > 1 ? room / (parts - 1) : preferred) / unit) * unit,
);

const splitRows = (count, rows) => Array.from({ length: rows }, (_, i) => Math.ceil((count - i) / rows));

function rowsShape(count, rows) {
  const sizes = splitRows(count, rows);
  const across = fitGap(160, 880, Math.max(...sizes), sizes.some(size => size % 2 === 0) ? 2 * GRID : GRID);
  const depth = fitGap(rows === 2 ? 160 : 120, 480, rows, rows % 2 === 0 ? 2 * GRID : GRID);
  return sizes.flatMap((size, j) => Array.from({ length: size }, (_, i) => [
    500 + (i - (size - 1) / 2) * across,
    310 + ((rows - 1) / 2 - j) * depth,
  ]));
}

function chevron(count, tipY) {
  const odd = count % 2 === 1;
  const spots = odd ? [[500, tipY]] : [];
  for (let i = 0; i < Math.floor(count / 2); i++) {
    const out = odd ? 80 * (i + 1) : 40 + 80 * i;
    const back = odd ? 80 * (i + 1) : 80 * i;
    spots.push([500 - out, tipY - back], [500 + out, tipY - back]);
  }
  return spots;
}

function wedgeShape(count) {
  if (count <= ROW_LIMIT) return chevron(count, 310 + 40 * (Math.ceil(count / 2) - 1));
  const spots = [];
  let left = count;
  for (let tipY = 550; tipY >= 70 && left > 0; tipY -= 160) {
    const take = Math.min(left, 2 * Math.min(6, Math.floor((tipY - 70) / 80) + 1));
    spots.push(...chevron(take, tipY));
    left -= take;
  }
  return [...spots, ...Array.from({ length: left }, () => [500, 310])];
}

const onGridLines = ([x, y]) => [500 + Math.round((x - 500) / GRID) * GRID, 310 + Math.round((y - 310) / GRID) * GRID];

function roundestCircle(count, smallest) {
  const circle = radius => Array.from({ length: count }, (_, k) => {
    const turn = Math.PI / 2 + (k * 2 * Math.PI) / count;
    return [500 + radius * Math.cos(turn), 310 + radius * Math.sin(turn)];
  });
  let best = null;
  for (let radius = 240; radius >= smallest; radius -= 20) {
    const rounded = circle(radius).map(onGridLines);
    const tight = rounded.some((spot, i) => apart(spot, rounded[(i + 1) % count]) < DANCER_WIDTH);
    const off = Math.max(...rounded.map(spot => Math.abs(apart(spot, [500, 310]) - radius)));
    if (count > 1 && tight) continue;
    if (!best || off < best.off) best = { off, spots: rounded };
  }
  return best ? best.spots : circle(smallest);
}

function ringShape(count) {
  const wanted = (count * 84) / (2 * Math.PI);
  if (wanted <= 240) return roundestCircle(count, Math.max(160, wanted));
  const ry = 240;
  const rx = Math.min(440, Math.sqrt(2 * wanted ** 2 - ry ** 2));
  const samples = Array.from({ length: 720 }, (_, i) => {
    const turn = Math.PI / 2 + (i / 720) * 2 * Math.PI;
    return [500 + rx * Math.cos(turn), 310 + ry * Math.sin(turn)];
  });
  const walked = [0];
  samples.forEach((sample, i) => walked.push(walked[i] + apart(sample, samples[(i + 1) % samples.length])));
  const whole = walked[samples.length];
  return Array.from({ length: count }, (_, k) => {
    const index = walked.findIndex(distance => distance >= (k * whole) / count);
    return samples[index % samples.length];
  });
}

function slantShape(count) {
  const lines = Math.ceil(count / ROW_LIMIT);
  return splitRows(count, lines).flatMap((size, j) => {
    const drop = size <= 7 ? 80 : 40;
    const middle = 310 + (drop === 40 && size % 2 === 0 ? 20 : 0) + ((lines - 1) / 2 - j) * 160;
    return Array.from({ length: size }, (_, i) => {
      const offset = i - (size - 1) / 2;
      return [500 + offset * 80, middle + offset * drop];
    });
  });
}

const SHAPES = {
  linie: {
    label: 'Linie',
    limit: ROW_LIMIT,
    note: 'In eine Reihe passen höchstens 12, der Rest steht dahinter.',
    spots: count => rowsShape(count, Math.ceil(count / ROW_LIMIT)),
    icon: [[6, 16], [15, 16], [24, 16], [33, 16], [42, 16]],
  },
  linien: {
    label: 'Zwei Linien',
    limit: 2 * ROW_LIMIT,
    note: 'In zwei Reihen passen höchstens 24, der Rest steht dahinter.',
    spots: count => rowsShape(count, Math.max(2, Math.ceil(count / ROW_LIMIT))),
    icon: [[11, 9], [20, 9], [29, 9], [38, 9], [6, 23], [15, 23], [24, 23], [33, 23], [42, 23]],
  },
  block: {
    label: 'Block',
    limit: MAX_DANCERS,
    note: '',
    spots: count => rowsShape(count, Math.max(1, Math.ceil(count / ROW_LIMIT), Math.round(Math.sqrt(count / 1.6)))),
    icon: [[12, 6], [24, 6], [36, 6], [12, 16], [24, 16], [36, 16], [12, 26], [24, 26], [36, 26]],
  },
  keil: {
    label: 'V',
    limit: ROW_LIMIT,
    note: 'In ein V passen höchstens 12, der Rest steht dahinter.',
    spots: wedgeShape,
    icon: [[6, 6], [15, 15], [24, 25], [33, 15], [42, 6]],
  },
  kreis: {
    label: 'Kreis',
    limit: 28,
    note: 'In den Kreis passen höchstens 28, der Rest rückt nach innen.',
    spots: ringShape,
    icon: [[24, 4], [33, 7], [37, 16], [33, 25], [24, 28], [15, 25], [11, 16], [15, 7]],
  },
  diagonale: {
    label: 'Diagonale',
    limit: ROW_LIMIT,
    note: 'In eine Diagonale passen höchstens 12, der Rest steht daneben.',
    spots: slantShape,
    icon: [[6, 4], [15, 10], [24, 16], [33, 22], [42, 28]],
  },
};

const shapeIcon = points => `<svg class="shape-icon" viewBox="0 0 48 32" aria-hidden="true">${points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6"/>`).join('')}</svg>`;

function nearestOrder(from, spots) {
  const order = [...spots];
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < order.length; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const now = apart(from[i], order[i]) + apart(from[j], order[j]);
        const swapped = apart(from[i], order[j]) + apart(from[j], order[i]);
        if (swapped < now - 0.001) {
          [order[i], order[j]] = [order[j], order[i]];
          improved = true;
        }
      }
    }
  }
  return order;
}
