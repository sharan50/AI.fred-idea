// Timestamps are RFC 3339 strings with an offset, as the pages print them;
// arithmetic is done in milliseconds and the result keeps the input's offset.
const DUR = /^P(?!$)(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?=\d)(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

export function parseDuration(s) {
  const m = DUR.exec(s);
  if (!m) throw new Error(`not an ISO 8601 duration: ${s}`);
  const [, y, mo, w, d, h, mi, sec] = m.map((x) => (x === undefined ? 0 : Number(x)));
  if (y || mo) throw new Error(`durations in years or months are not exact: ${s}`);
  return (((w * 7 + d) * 24 + h) * 60 + mi) * 60000 + sec * 1000;
}

export function ms(iso) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) throw new Error(`not a timestamp: ${iso}`);
  return t;
}

export function offsetOf(iso) {
  const m = /(Z|[+-]\d{2}:\d{2})$/.exec(iso);
  return m ? m[1] : 'Z';
}

function pad(n, w = 2) {
  return String(n).padStart(w, '0');
}

export function iso(t, offset = '+05:30') {
  const sign = offset === 'Z' ? 0 : offset.startsWith('-') ? -1 : 1;
  const mins = offset === 'Z' ? 0 : sign * (Number(offset.slice(1, 3)) * 60 + Number(offset.slice(4, 6)));
  const d = new Date(t + mins * 60000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}${offset === 'Z' ? 'Z' : offset}`;
}

export function add(isoTime, duration) {
  return iso(ms(isoTime) + parseDuration(duration), offsetOf(isoTime));
}

export function addMs(isoTime, delta) {
  return iso(ms(isoTime) + delta, offsetOf(isoTime));
}

export function before(a, b) {
  return ms(a) < ms(b);
}

export function earliest(list) {
  return list.reduce((acc, t) => (acc === null || ms(t) < ms(acc) ? t : acc), null);
}

export function min(a, b) {
  return ms(a) <= ms(b) ? a : b;
}
