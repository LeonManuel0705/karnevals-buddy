const STORAGE_KEY = 'karnevals-buddy';
const SCHEMA_VERSION = 4;
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
    formationSnap: true,
    formationGhost: false,
    groups: [],
    lastBackupAt: 0,
    backupSnoozedUntil: 0,
    damagedAt: 0,
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
  const [x, y] = point.map(value => (typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN));
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

const timeUpTo = (value, latest) => (Number.isFinite(value) && value > 0 && value <= latest ? value : 0);

function normalizeGroups(groups) {
  const groupId = idKeeper();
  return objects(groups).map(group => ({
    id: groupId(group.id),
    name: asText(group.name).trim().slice(0, 30) || 'Gruppe',
    people: objects(group.people).slice(0, MAX_DANCERS).map((person, i) => ({
      name: asText(person.name).trim().slice(0, 20) || String(i + 1),
      flavor: FLAVORS.includes(person.flavor) ? person.flavor : FLAVORS[i % FLAVORS.length],
    })),
  }));
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
    formationSnap: data.formationSnap !== false,
    formationGhost: data.formationGhost === true,
    groups: normalizeGroups(data.groups),
    lastBackupAt: timeUpTo(data.lastBackupAt, Date.now() + DAY),
    backupSnoozedUntil: timeUpTo(data.backupSnoozedUntil, Date.now() + 31 * DAY),
    damagedAt: Number.isFinite(data.damagedAt) && data.damagedAt > 0 ? data.damagedAt : 0,
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

const DAILY_PREFIX = `${STORAGE_KEY}-stand-`;
const BEFORE_PREFIX = `${STORAGE_KEY}-davor-`;
const UPDATE_PREFIX = `${STORAGE_KEY}-vor-update-`;
const IMPORT_KEY = `${STORAGE_KEY}-vor-import`;
const UNREADABLE_KEY = `${STORAGE_KEY}-unlesbar`;
const DAILY_KEEP = 5;
const STORAGE_UNREADABLE_TEXT = 'Der Speicher lässt sich gerade nicht lesen. Schließ den Buddy einmal ganz und öffne ihn neu.';
let storageUnreadable = false;
let unreadableOnLoad = false;
let unreadableRaw = null;
let unreadableKept = false;
let lastRestored = null;
let untouchedText = null;
let unsavedOnScreen = false;

function storedKeys(prefix) {
  try {
    return Object.keys(localStorage).filter(key => key.startsWith(prefix)).sort();
  } catch (err) {
    return [];
  }
}

function dailyKeys() {
  return storedKeys(DAILY_PREFIX).filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key.slice(DAILY_PREFIX.length)));
}

function copyKeys() {
  return [...dailyKeys(), ...storedKeys(BEFORE_PREFIX), ...storedKeys(UPDATE_PREFIX), ...storedKeys(IMPORT_KEY), ...storedKeys(UNREADABLE_KEY)];
}

function removeStored(keys) {
  try {
    keys.forEach(key => localStorage.removeItem(key));
  } catch (err) {
    console.warn('Kopie ließ sich nicht entfernen', err);
  }
}

// All or nothing. When space runs out older copies make room, cheapest first, her current data
// matters more than any of them. If it still does not fit, everything goes back as it was.
function storeAll(entries, canDrop = 'all', keep = []) {
  const before = [];
  const untouchable = new Set([...entries.map(([key]) => key), ...keep]);
  const remember = key => {
    if (!before.some(([known]) => known === key)) before.push([key, localStorage.getItem(key)]);
  };
  const droppable = () => {
    if (canDrop === 'none') return [];
    const cheap = [...storedKeys(UPDATE_PREFIX), ...dailyKeys()];
    if (canDrop === 'cheap') return cheap;
    return [...cheap, ...storedKeys(BEFORE_PREFIX), IMPORT_KEY, ...storedKeys(UNREADABLE_KEY)];
  };
  try {
    for (const [key, text] of entries) {
      remember(key);
      for (;;) {
        try {
          localStorage.setItem(key, text);
          break;
        } catch (err) {
          const next = /quota/i.test(err.name) && droppable().find(name => !untouchable.has(name) && localStorage.getItem(name) !== null);
          if (!next) throw err;
          remember(next);
          localStorage.removeItem(next);
        }
      }
    }
    return true;
  } catch (err) {
    console.warn('Speichern ging nicht', err);
    // New keys go first: the copies that made room for them only fit again once they are gone.
    [...before.filter(([, value]) => value === null), ...before.filter(([, value]) => value !== null)].forEach(([key, value]) => {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch (undoErr) {
        console.warn('Zurücksetzen ging nicht', undoErr);
      }
    });
    return false;
  }
}

// What stood there when the app first opened that day, so a slip today can still be undone tomorrow.
function keepDailyCopy() {
  // While a damage is open the days are what she can go back to, so they stay exactly as they are.
  if (unreadableOnLoad || state.damagedAt) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return;
    const today = todayIso();
    const key = `${DAILY_PREFIX}${today}`;
    const keys = dailyKeys();
    const past = keys.filter(name => name.slice(DAILY_PREFIX.length) <= today);
    if (past.includes(key) || (past.length && localStorage.getItem(past[past.length - 1]) === raw)) return;
    if (!storeAll([[key, raw]], 'cheap')) return;
    const left = dailyKeys();
    const future = left.filter(name => name.slice(DAILY_PREFIX.length) > today);
    const rest = left.filter(name => name.slice(DAILY_PREFIX.length) <= today);
    removeStored([...future, ...rest].slice(0, Math.max(0, left.length - DAILY_KEEP)));
  } catch (err) {
    console.warn('Tagesstand ging nicht', err);
  }
}

// The same damage comes back on every start until she acts, it needs only one copy.
function noteUnreadable(raw) {
  unreadableOnLoad = true;
  unreadableRaw = raw;
  try {
    unreadableKept = storedKeys(UNREADABLE_KEY).some(key => localStorage.getItem(key) === raw)
      || storeAll([[`${UNREADABLE_KEY}-${Date.now()}`, raw]], 'none');
  } catch (err) {
    unreadableKept = false;
  }
}

// Swaps everything for another state and keeps what stood there, each time under its own key: the stored
// text as it is, unless a failed save left newer entries only on screen. A copy is only skipped when the
// state she just brought back still lies under the key it came from, and days do not count, they rotate.
function replaceStored(kind, next, source = null) {
  if (storageUnreadable) return false;
  const text = JSON.stringify(next);
  const now = Date.now();
  const onScreen = JSON.stringify(state);
  const entries = [[STORAGE_KEY, text]];
  let keep = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const damageInPlace = unreadableRaw !== null && stored === unreadableRaw;
    if (damageInPlace && !unreadableKept) entries.unshift([`${UNREADABLE_KEY}-${now}`, unreadableRaw]);
    const stillThere = onScreen === lastRestored?.text && localStorage.getItem(lastRestored.key) === lastRestored.raw;
    if (stillThere) keep = [lastRestored.key];
    else if (onScreen !== untouchedText) entries.unshift([`${BEFORE_PREFIX}${now}-${kind}`, unsavedOnScreen || stored === null || damageInPlace ? onScreen : stored]);
  } catch (err) {
    return false;
  }
  if (!storeAll(entries, 'all', keep)) return false;
  state = next;
  lastRestored = source && !source.key.startsWith(DAILY_PREFIX) ? { text, key: source.key, raw: source.raw } : null;
  untouchedText = null;
  unsavedOnScreen = false;
  unreadableOnLoad = false;
  unreadableRaw = null;
  return true;
}

function nothingOfHers(data) {
  untouchedText = JSON.stringify(data);
  return data;
}

const damagedPlaceholder = () => nothingOfHers({ ...freshState({ withSample: false }), damagedAt: Date.now() });

function loadState() {
  storageUnreadable = false;
  unreadableOnLoad = false;
  unreadableRaw = null;
  unreadableKept = false;
  lastRestored = null;
  untouchedText = null;
  unsavedOnScreen = false;
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    storageUnreadable = true;
    return nothingOfHers(freshState());
  }
  if (raw === null) {
    if (!copyKeys().length) return nothingOfHers(freshState());
    // Copies without the data they were taken from: nothing in the app leaves storage like this.
    unreadableOnLoad = true;
    unreadableKept = true;
    return damagedPlaceholder();
  }

  try {
    const saved = JSON.parse(raw);
    if (isValidState(saved)) {
      const version = Number(saved.version) || 1;
      const repaired = normalizeState(saved);
      if (version < SCHEMA_VERSION) storeAll([[`${UPDATE_PREFIX}${version}`, raw], [STORAGE_KEY, JSON.stringify(repaired)]], 'cheap');
      return repaired;
    }
  } catch (err) {
    console.warn('Gespeicherte Daten konnten nicht gelesen werden', err);
  }
  noteUnreadable(raw);
  return damagedPlaceholder();
}

function clearCopies() {
  removeStored(storedKeys(`${STORAGE_KEY}-`));
  unreadableOnLoad = false;
  unreadableRaw = null;
  unreadableKept = false;
  lastRestored = null;
  untouchedText = null;
  unsavedOnScreen = false;
}

let state = loadState();
keepDailyCopy();

function save({ quiet = false } = {}) {
  // Until the unreadable data is safe somewhere else, the main key is its only home.
  const blocked = storageUnreadable || (unreadableOnLoad && !unreadableKept);
  unsavedOnScreen = blocked || !storeAll([[STORAGE_KEY, JSON.stringify(state)]], state.damagedAt ? 'none' : 'all');
  if (!unsavedOnScreen) return true;
  if (!quiet) toast(storageUnreadable ? STORAGE_UNREADABLE_TEXT : 'Speichern hat nicht geklappt. Ist der Speicher voll?', { urgent: true });
  return false;
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
