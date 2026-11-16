// Minimal built-in scheduler: one calendar, availability from config, bookings in data/bookings.json.
// Double-booking prevention: every booking blocks [start - bufferBefore, end + bufferAfter]; a new
// appointment's blocked interval may not overlap any existing one. Node is single-threaded and the
// check+write below is synchronous, so two requests can't both pass the check in this process.
const fs = require('fs');
const path = require('path');
const CONFIG = require('./config');
const PATHS = require('./paths');
const FILE = PATHS.BOOKINGS_FILE;
const TZ = CONFIG.TIMEZONE;

function load() { return fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : []; }
function save(list) { PATHS.writeJSON(FILE, list); }

// Offset (minutes) of TZ at a given instant, e.g. -300 for EST.
function tzOffset(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(date).map(p => [p.type, p.value]));
  const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUTC - date.getTime()) / 60000);
}
// Local wall time in TZ -> Date
function zoned(y, m, d, hh, mm) {
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const off = tzOffset(guess);
  const t = new Date(guess.getTime() - off * 60000);
  const off2 = tzOffset(t);
  return off2 === off ? t : new Date(guess.getTime() - off2 * 60000);
}
function localYMD(date) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(date).map(x => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, key: `${p.year}-${p.month}-${p.day}`, weekday: p.weekday };
}
const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function blocked(type, start) {
  const a = CONFIG.APPOINTMENT[type];
  const s = new Date(start).getTime();
  return [s - a.bufferBefore * 60000, s + (a.minutes + a.bufferAfter) * 60000];
}
const overlaps = (x, y) => x[0] < y[1] && y[0] < x[1];
function conflicts(type, start, list) {
  const iv = blocked(type, start);
  return list.some(b => b.status !== 'cancelled' && overlaps(iv, blocked(b.type, b.start)));
}

// All candidate starts for a type (ignores existing bookings)
function candidates(type, now = new Date()) {
  const a = CONFIG.APPOINTMENT[type];
  const out = [];
  const earliest = now.getTime() + CONFIG.MIN_NOTICE_HOURS * 3600000;
  for (let i = 0; i <= CONFIG.BOOKING_DAYS_AHEAD; i++) {
    const day = localYMD(new Date(now.getTime() + i * 86400000));
    if (CONFIG.BLACKOUT_DATES.includes(day.key)) continue;
    const windows = CONFIG.AVAILABILITY[WD[day.weekday]] || [];
    const slots = [];
    for (const [from, to] of windows) {
      const [fh, fm] = from.split(':').map(Number), [th, tm] = to.split(':').map(Number);
      const winEnd = zoned(day.y, day.m, day.d, th, tm).getTime();
      for (let t = zoned(day.y, day.m, day.d, fh, fm).getTime(); t + a.minutes * 60000 <= winEnd; t += CONFIG.SLOT_STEP_MINUTES * 60000) {
        if (t >= earliest) slots.push(new Date(t).toISOString());
      }
    }
    if (slots.length) out.push({ date: day.key, weekday: day.weekday, slots });
  }
  // de-duplicate days (DST edge)
  return out.filter((d, i, arr) => arr.findIndex(x => x.date === d.date) === i);
}

function availableSlots(type, now = new Date()) {
  const list = load();
  return candidates(type, now).map(d => ({ ...d, slots: d.slots.filter(s => !conflicts(type, s, list)) })).filter(d => d.slots.length);
}

function book({ type, start, name, email, phone, address }) {
  if (!CONFIG.APPOINTMENT[type]) return { ok: false, message: 'Unknown appointment type.' };
  const iso = new Date(start).toISOString();
  const valid = candidates(type).some(d => d.slots.includes(iso));
  if (!valid) return { ok: false, message: 'That time is not available. Please pick another slot.' };
  const list = load();
  if (conflicts(type, iso, list)) return { ok: false, message: 'Sorry, that time was just booked. Please pick another slot.' };
  const a = CONFIG.APPOINTMENT[type];
  const booking = { id: 'bk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), type, start: iso,
    end: new Date(new Date(iso).getTime() + a.minutes * 60000).toISOString(), name, email, phone, address, status: 'requested', createdAt: new Date().toISOString() };
  list.push(booking); save(list);
  return { ok: true, booking };
}

module.exports = { availableSlots, book, candidates, zoned };
