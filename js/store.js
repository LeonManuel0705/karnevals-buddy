const STORAGE_KEY = 'karnevals-buddy';
const SCHEMA_VERSION = 2;
const FLAVORS = ['himbeer', 'zitrone', 'waldmeister', 'veilchen', 'brause'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const CLOCK = /^\d{2}:\d{2}$/;

const DEFAULT_TEMPLATES = {
  auftritt: ['Handy', 'Powerbank', 'Schlüssel', 'Geld', 'Kostüm', 'Hut', 'Handtuch', 'Socken für Tanzschuhe', 'Tanzschuhe', 'Make-up', 'Wasser'],
  feiern: ['Handy', 'Powerbank', 'Schlüssel', 'Geld', 'Kostüm', 'Hut', 'Make-up', 'Wasser'],
};

const EVENT_TYPES = {
  auftritt: { label: 'Auftritt', flavor: 'himbeer' },
  feiern: { label: 'Feiern', flavor: 'zitrone' },
};

const COSTUME_GROUPS = [
  { key: 'schuhe', label: 'Schuhe' },
  { key: 'kleidung', label: 'Kleidung' },
  { key: 'accessoires', label: 'Accessoires' },
  { key: 'makeup', label: 'Make-up' },
];

const NOTE_CATEGORIES = {
  versammlung: { label: 'Versammlung', icon: 'users' },
  training: { label: 'Training', icon: 'clipboard' },
  sonstiges: { label: 'Sonstiges', icon: 'sticky' },
};

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function starterCostume() {
  const parts = [
    ['schuhe', 'Tanzschuhe'],
    ['schuhe', 'Socken für Tanzschuhe'],
    ['kleidung', 'Jacke'],
    ['kleidung', 'Rock und Petticoat'],
    ['kleidung', 'Strumpfhose'],
    ['accessoires', 'Hut'],
    ['accessoires', 'Handschuhe'],
    ['makeup', 'Rouge'],
    ['makeup', 'Wimperntusche'],
    ['makeup', 'Lippenstift'],
  ];
  return {
    id: newId(),
    name: 'Gardeuniform',
    parts: parts.map(([group, label]) => ({ id: newId(), group, label, done: false })),
  };
}

function freshState({ withSample = true } = {}) {
  return {
    version: SCHEMA_VERSION,
    name: '',
    events: [],
    costumes: withSample ? [starterCostume()] : [],
    templates: {
      auftritt: [...DEFAULT_TEMPLATES.auftritt],
      feiern: [...DEFAULT_TEMPLATES.feiern],
    },
    notes: [],
  };
}

function isValidState(data) {
  return Boolean(data)
    && typeof data === 'object'
    && Array.isArray(data.events)
    && Array.isArray(data.costumes)
    && Array.isArray(data.notes);
}

const MAX_DANCERS = 40;
const MAX_STEPS = 30;
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

const asText = value => (typeof value === 'string' ? value : '');
const isIso = value => typeof value === 'string' && ISO_DATE.test(value);
const isClock = value => typeof value === 'string' && CLOCK.test(value);
const oneOf = (table, value) => typeof value === 'string' && Object.prototype.hasOwnProperty.call(table, value);
const objects = list => (Array.isArray(list) ? list.filter(item => item && typeof item === 'object') : []);
const texts = list => (Array.isArray(list) ? list.filter(item => typeof item === 'string') : null);

function idKeeper() {
  const seen = new Set();
  return value => {
    const id = typeof value === 'string' && SAFE_ID.test(value) && !seen.has(value) ? value : newId();
    seen.add(id);
    return id;
  };
}

function validPoint(point) {
  if (!Array.isArray(point) || point.length !== 2) return null;
  const [x, y] = point.map(Number);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return [Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y))];
}

function normalizeFormation(formation) {
  const dancerId = idKeeper();
  const stepId = idKeeper();
  const dancers = objects(formation?.dancers).slice(0, MAX_DANCERS).map((dancer, i) => ({
    from: dancer.id,
    id: dancerId(dancer.id),
    name: asText(dancer.name).trim().slice(0, 20) || String(i + 1),
    flavor: FLAVORS.includes(dancer.flavor) ? dancer.flavor : FLAVORS[i % FLAVORS.length],
  }));
  const place = step => Object.fromEntries(dancers.map(d => [
    d.id,
    validPoint(typeof d.from === 'string' ? step?.pos?.[d.from] : null) || [0.5, 0.5],
  ]));
  const steps = objects(formation?.steps).slice(0, MAX_STEPS).map((step, i) => ({
    id: stepId(step.id),
    label: asText(step.label).trim().slice(0, 30) || `Bild ${i + 1}`,
    pos: place(step),
  }));
  return {
    dancers: dancers.map(({ from, ...dancer }) => dancer),
    steps: steps.length ? steps : [{ id: newId(), label: 'Bild 1', pos: place(null) }],
  };
}

function normalizeNote(note, noteId) {
  const isFormation = note.kind === 'formation';
  return {
    ...note,
    id: noteId(note.id),
    kind: isFormation ? 'formation' : 'text',
    title: asText(note.title),
    body: asText(note.body),
    category: oneOf(NOTE_CATEGORIES, note.category) ? note.category : 'sonstiges',
    date: isIso(note.date) ? note.date : todayIso(),
    updatedAt: Number.isFinite(note.updatedAt) ? note.updatedAt : 0,
    ...(isFormation ? { formation: normalizeFormation(note.formation) } : {}),
  };
}

function normalizeState(data) {
  const costumeId = idKeeper();
  const partId = idKeeper();
  const eventId = idKeeper();
  const itemId = idKeeper();
  const noteId = idKeeper();
  const costumeIds = new Map();

  const costumes = objects(data.costumes).map(costume => {
    const id = costumeId(costume.id);
    if (typeof costume.id === 'string' && !costumeIds.has(costume.id)) costumeIds.set(costume.id, id);
    return {
      ...costume,
      id,
      name: asText(costume.name) || 'Kostüm',
      parts: objects(costume.parts).map(part => ({
        id: partId(part.id),
        group: COSTUME_GROUPS.some(g => g.key === part.group) ? part.group : 'kleidung',
        label: asText(part.label),
        done: part.done === true,
      })),
    };
  });

  return {
    ...data,
    version: SCHEMA_VERSION,
    name: asText(data.name).slice(0, 40),
    events: objects(data.events).filter(ev => isIso(ev.date)).map(ev => ({
      ...ev,
      id: eventId(ev.id),
      name: asText(ev.name) || 'Termin',
      type: oneOf(EVENT_TYPES, ev.type) ? ev.type : 'auftritt',
      time: isClock(ev.time) ? ev.time : '',
      meetTime: isClock(ev.meetTime) ? ev.meetTime : '',
      place: asText(ev.place),
      people: asText(ev.people),
      costumeId: costumeIds.get(ev.costumeId) ?? '',
      packing: objects(ev.packing).map(item => ({ id: itemId(item.id), label: asText(item.label), done: item.done === true })),
    })),
    costumes,
    templates: {
      auftritt: texts(data.templates?.auftritt) ?? [...DEFAULT_TEMPLATES.auftritt],
      feiern: texts(data.templates?.feiern) ?? [...DEFAULT_TEMPLATES.feiern],
    },
    notes: objects(data.notes).map(note => normalizeNote(note, noteId)),
  };
}

function keepCopy(suffix, raw) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${suffix}`, raw);
  } catch (err) {
    console.warn('Sicherungskopie ging nicht', err);
  }
}

function loadState() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    return freshState();
  }
  if (raw === null) return freshState();

  try {
    const saved = JSON.parse(raw);
    if (isValidState(saved)) {
      const version = Number(saved.version) || 1;
      const repaired = normalizeState(saved);
      if (version < SCHEMA_VERSION) {
        keepCopy(`vor-update-${version}`, raw);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(repaired));
        } catch (err) {
          console.warn('Aktualisierte Daten konnten nicht gespeichert werden', err);
        }
      }
      return repaired;
    }
  } catch (err) {
    console.warn('Gespeicherte Daten konnten nicht gelesen werden', err);
  }
  keepCopy('unlesbar', raw);
  return freshState({ withSample: false });
}

function clearCopies() {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(`${STORAGE_KEY}-`))
      .forEach(key => localStorage.removeItem(key));
  } catch (err) {
    console.warn('Alte Kopien ließen sich nicht löschen', err);
  }
}

let state = loadState();

function save({ quiet = false } = {}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    if (!quiet) toast('Speichern hat nicht geklappt. Ist der Speicher voll?');
    return false;
  }
}

function replaceState(data) {
  state = data;
  save();
}

function findEvent(id) {
  return state.events.find(ev => ev.id === id);
}

function findCostume(id) {
  return state.costumes.find(c => c.id === id);
}

function packingFromTemplate(type) {
  return state.templates[type].map(label => ({ id: newId(), label, done: false }));
}

function countDone(items) {
  return items.filter(item => item.done).length;
}

function isComplete(items) {
  return items.length > 0 && items.every(item => item.done);
}
