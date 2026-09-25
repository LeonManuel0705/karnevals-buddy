const HOUR = 3600000;
const DAY = 24 * HOUR;
const EVENT_STAYS_FOR = 6 * HOUR;
const MEET_LEAD = 2 * HOUR;

const longDate = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
const shortMonth = new Intl.DateTimeFormat('de-DE', { month: 'short' });

function eventStart(ev) {
  const [year, month, day] = ev.date.split('-').map(Number);
  const [hours, minutes] = (ev.time || '00:00').split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function meetStart(ev) {
  if (!ev.meetTime) return null;
  return eventStart({ date: ev.date, time: ev.meetTime });
}

function eventEnd(ev) {
  const start = eventStart(ev);
  if (ev.time) return start.getTime() + EVENT_STAYS_FOR;
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1).getTime();
}

function effectiveStart(ev) {
  return ev.time ? eventStart(ev) : (meetStart(ev) || eventStart(ev));
}

function upcomingEvents(now = new Date()) {
  return state.events
    .filter(ev => eventEnd(ev) > now.getTime())
    .sort((a, b) => effectiveStart(a) - effectiveStart(b));
}

function pastEvents(now = new Date()) {
  return state.events
    .filter(ev => eventEnd(ev) <= now.getTime())
    .sort((a, b) => effectiveStart(b) - effectiveStart(a));
}

function currentEvent(upcoming, now = new Date()) {
  const running = upcoming.filter(ev => eventStart(ev) <= now);
  const ahead = upcoming.find(ev => eventStart(ev) > now);
  const aheadMeet = ahead && meetStart(ahead);
  if (running.length && aheadMeet && aheadMeet - now <= MEET_LEAD) return ahead;

  const timed = running.filter(ev => ev.time);
  if (timed.length) return timed[timed.length - 1];

  const untimed = running[running.length - 1];
  const nextTimed = upcoming.find(ev => ev.time && eventStart(ev) > now);
  const untimedMeet = untimed && meetStart(untimed);
  if (untimed && nextTimed && nextTimed.date === untimed.date && !(untimedMeet && untimedMeet <= eventStart(nextTimed))) {
    return nextTimed;
  }
  return untimed || upcoming[0] || null;
}

function countdownParts(target, now = new Date()) {
  const shift = (now.getTimezoneOffset() - target.getTimezoneOffset()) * 60000;
  let ms = Math.max(0, target - now + shift);
  const days = Math.floor(ms / DAY);
  ms -= days * DAY;
  const hours = Math.floor(ms / HOUR);
  ms -= hours * HOUR;
  const minutes = Math.floor(ms / 60000);
  ms -= minutes * 60000;
  return { days, hours, minutes, seconds: Math.floor(ms / 1000) };
}

function formatTime(ev) {
  return ev.time ? `${ev.time} Uhr` : 'ohne Uhrzeit';
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function relativeDay(date, now = new Date()) {
  const diff = Math.round((startOfDay(date) - startOfDay(now)) / DAY);
  if (diff === 0) return 'heute';
  if (diff === 1) return 'morgen';
  if (diff === 2) return 'übermorgen';
  if (diff > 0) return `in ${diff} Tagen`;
  if (diff === -1) return 'gestern';
  return `vor ${-diff} Tagen`;
}

function todayIso(now = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function nextSeasonDate(now = new Date()) {
  const dates = [];
  for (const year of [now.getFullYear(), now.getFullYear() + 1]) {
    const easter = easterSunday(year);
    dates.push({ name: 'Sessionsstart', start: new Date(year, 10, 11, 11, 11) });
    dates.push({ name: 'Weiberfastnacht', start: new Date(year, easter.getMonth(), easter.getDate() - 52, 11, 11) });
  }
  return dates.filter(d => d.start > now).sort((a, b) => a.start - b.start)[0];
}
