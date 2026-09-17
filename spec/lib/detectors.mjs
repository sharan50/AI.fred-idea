// The four detectors of 02, 10.1 and 03, 1.2, as one policy artefact shipped
// to the vault's edge proxy and to the hash service's screen alike:
// identifier pattern (with the date and amount patterns), known-value digest,
// the user's declaration, and the dictionary of health and legal terms. The
// formats are Table 3.1's starting set; a market's surface settings fix them.

export const DIGIT_WORDS = { zero: '0', oh: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', double: null, triple: null };

const MONTHS = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
const MONTH_INDEX = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

export function luhn(digits) {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

// Each pattern: a class, a type (the alias's type segment), a regular
// expression, an optional check and a normaliser to the canonical form.
export const PATTERNS = [
  { type: 'pan', cls: 'identity-number', re: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi, normalise: (m) => m.toUpperCase() },
  { type: 'card', cls: 'payment-instrument', re: /\b(?:[0-9]{4}[ -]?){3}[0-9]{1,7}\b/g, normalise: (m) => m.replace(/[ -]/g, ''), check: (m) => { const d = m.replace(/[ -]/g, ''); return d.length >= 13 && d.length <= 19 && luhn(d); } },
  { type: 'ifsc', cls: 'payment-instrument', re: /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi, normalise: (m) => m.toUpperCase() },
  { type: 'sort-code', cls: 'payment-instrument', re: /\b[0-9]{2}-[0-9]{2}-[0-9]{2}\b/g, normalise: (m) => m.replace(/-/g, '') },
  { type: 'expiry', cls: 'payment-instrument', re: /\b(0[1-9]|1[0-2])[/-](?:[0-9]{2}|20[0-9]{2})\b/g, normalise: (m) => m.replace(/[/-]/g, '') },
  { type: 'aadhaar', cls: 'identity-number', re: /\b[2-9][0-9]{3}[ -]?[0-9]{4}[ -]?[0-9]{4}\b/g, normalise: (m) => m.replace(/[ -]/g, '') },
  { type: 'ssn', cls: 'identity-number', re: /\b[0-9]{3}-?[0-9]{2}-?[0-9]{4}\b/g, normalise: (m) => m.replace(/-/g, ''), check: (m) => /-/.test(m) || m.length === 9 },
  { type: 'ni-number', cls: 'identity-number', re: /\b[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z] ?[0-9]{2} ?[0-9]{2} ?[0-9]{2} ?[A-D]\b/gi, normalise: (m) => m.replace(/ /g, '').toUpperCase() },
  { type: 'nhs-number', cls: 'identity-number', re: /\b[0-9]{3}[ -]?[0-9]{3}[ -]?[0-9]{4}\b/g, normalise: (m) => m.replace(/[ -]/g, ''), check: (m) => /[ -]/.test(m) },
  { type: 'passport', cls: 'identity-number', re: /\b[A-Z]{1,2}[0-9]{6,9}\b/g, normalise: (m) => m.toUpperCase() },
  { type: 'account', cls: 'payment-instrument', re: /\b[0-9]{8,18}\b/g, normalise: (m) => m, check: (m) => m.length >= 8 && m.length <= 18 },
  { type: 'amount', cls: 'financial-fact', re: /(?:(?:₹|rs\.?|inr|£|gbp|\$|usd)\s?[0-9][0-9,]*(?:\.[0-9]+)?(?:\s?(?:lakhs?|crores?|thousand|k|million))?|\b[0-9][0-9,]*(?:\.[0-9]+)?\s?(?:lakhs?|crores?|thousand|million)?\s?(?:rupees|pounds|dollars)\b|\b[0-9][0-9,]*(?:\.[0-9]+)?\s?(?:lakhs?|crores?)\b)/gi, normalise: normaliseAmount },
  { type: 'date', cls: 'personal-fact', re: new RegExp(`\\b(?:[0-9]{1,2}[/.-][0-9]{1,2}[/.-](?:[0-9]{4}|[0-9]{2})|[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTHS})\\.?,?\\s+(?:[0-9]{4}|[0-9]{2})|(?:${MONTHS})\\.?\\s+[0-9]{1,2}(?:st|nd|rd|th)?,?\\s+(?:[0-9]{4}|[0-9]{2}))\\b`, 'gi'), normalise: normaliseDate },
  { type: 'email', cls: 'personal-fact', re: /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, normalise: (m) => m.toLowerCase() },
  { type: 'phone', cls: 'personal-fact', re: /(?:\+[0-9]{1,3}[ -]?)?(?:\(?[0-9]{2,5}\)?[ -]?)?[0-9]{3,5}[ -]?[0-9]{4,5}\b/g, normalise: (m) => m.replace(/[^0-9]/g, '').slice(-10), check: (m) => { const d = m.replace(/[^0-9]/g, ''); return d.length >= 10 && d.length <= 13 && /^\+|^\(?0|^[6-9]/.test(m.trim()); } },
  { type: 'postcode', cls: 'personal-fact', re: /\b[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}\b/g, normalise: (m) => m.replace(/ /g, '').toUpperCase() },
];

export function normaliseAmount(m) {
  const s = m.toLowerCase().replace(/,/g, '');
  const num = /([0-9]+(?:\.[0-9]+)?)/.exec(s);
  if (!num) return s;
  let n = Number(num[1]);
  if (/lakh/.test(s)) n *= 100000;
  else if (/crore/.test(s)) n *= 10000000;
  else if (/thousand|\bk\b/.test(s)) n *= 1000;
  else if (/million/.test(s)) n *= 1000000;
  const cur = /₹|rs|inr|rupee/.test(s) ? 'INR' : /£|gbp|pound/.test(s) ? 'GBP' : /\$|usd|dollar/.test(s) ? 'USD' : 'XXX';
  return `${cur}:${n}`;
}

// Dates in every numeric order and with month names: the canonical forms are
// every reading the run admits, so 03/04/1985 digests as both the third of
// April and the fourth of March.
export function dateForms(m) {
  const forms = new Set();
  const year = (y) => (y.length === 2 ? (Number(y) > 30 ? `19${y}` : `20${y}`) : y);
  const pad = (n) => String(Number(n)).padStart(2, '0');
  let x;
  if ((x = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(m))) forms.add(`${x[1]}-${x[2]}-${x[3]}`);
  else if ((x = /^([0-9]{1,2})[/.-]([0-9]{1,2})[/.-]([0-9]{2,4})$/.exec(m))) {
    const y = year(x[3]);
    if (Number(x[2]) <= 12) forms.add(`${y}-${pad(x[2])}-${pad(x[1])}`);
    if (Number(x[1]) <= 12) forms.add(`${y}-${pad(x[1])}-${pad(x[2])}`);
  } else if ((x = new RegExp(`^([0-9]{1,2})(?:st|nd|rd|th)?\\s+(${MONTHS})\\.?,?\\s+([0-9]{2,4})$`, 'i').exec(m))) {
    forms.add(`${year(x[3])}-${pad(MONTH_INDEX[x[2].slice(0, 3).toLowerCase()])}-${pad(x[1])}`);
  } else if ((x = new RegExp(`^(${MONTHS})\\.?\\s+([0-9]{1,2})(?:st|nd|rd|th)?,?\\s+([0-9]{2,4})$`, 'i').exec(m))) {
    forms.add(`${year(x[3])}-${pad(MONTH_INDEX[x[1].slice(0, 3).toLowerCase()])}-${pad(x[2])}`);
  }
  return [...forms];
}

export function normaliseDate(m) {
  return dateForms(m)[0] || m;
}

// Spoken digits become digits: "four one one one" reads 4111. A run of at
// least four digit words is a spoken number.
export function unspeak(text) {
  return text.replace(/\b((?:(?:zero|oh|one|two|three|four|five|six|seven|eight|nine|double|triple)\b[\s,-]*){4,})/gi, (run) => {
    const words = run.trim().replace(/,/g, ' ').split(/[\s-]+/).filter(Boolean);
    let out = '';
    let repeat = 1;
    for (const w of words) {
      const lw = w.toLowerCase();
      if (lw === 'double') repeat = 2;
      else if (lw === 'triple') repeat = 3;
      else {
        out += DIGIT_WORDS[lw].repeat(repeat);
        repeat = 1;
      }
    }
    const trail = /[\s,-]*$/.exec(run)[0];
    return out + (/\s/.test(trail) ? ' ' : '');
  });
}

const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000, lakh: 100000, lakhs: 100000, crore: 10000000, crores: 10000000, million: 1000000 };

// "two thousand five hundred rupees" becomes "2500 rupees", so the amount
// pattern catches an amount spoken as words.
export function unspeakAmounts(text) {
  return text.replace(/\b((?:(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|lakhs?|crores?|million|and)\b[\s-]*)+)(rupees|pounds|dollars)\b/gi, (run, words, cur) => {
    let total = 0;
    let current = 0;
    for (const w of words.trim().split(/[\s-]+/)) {
      const lw = w.toLowerCase();
      if (lw === 'and') continue;
      const v = NUMBER_WORDS[lw];
      if (v === undefined) return run;
      if (v === 100) current = (current || 1) * 100;
      else if (v >= 1000) {
        total += (current || 1) * v;
        current = 0;
      } else current += v;
    }
    return `${total + current} ${cur}`;
  });
}

// The candidate forms of one window of text, for a known-value match: the
// window as written and case-folded; compact where every token is a plain
// run; digits only where the window holds no letters; its date readings where
// it is date-shaped; its amount reading where it is amount-shaped. A window is
// never reduced to the digits of a sentence, so a bare last-four is covered
// and a sentence that happens to contain those digits is not.
export function windowCandidates(window) {
  const w = window.replace(/[.,;:!?)("']+$/, '').replace(/^[("']+/, '');
  const out = new Set([w, w.toLowerCase()]);
  if (/^[A-Za-z0-9]+([\s-][A-Za-z0-9]+)*$/.test(w)) {
    const compact = w.replace(/[\s-]/g, '');
    out.add(compact);
    out.add(compact.toUpperCase());
    out.add(compact.toLowerCase());
  }
  if (!/[A-Za-z]/.test(w) && /\d/.test(w)) out.add(w.replace(/\D/g, ''));
  if (/\d/.test(w) && /^[0-9]{1,2}(?:st|nd|rd|th)?[\s/.-]|^[0-9]{4}-|^[A-Za-z]{3,9}\.?\s+[0-9]/.test(w)) for (const f of dateForms(w)) out.add(f);
  if (/(?:₹|rs\.?|inr|£|gbp|\$|usd|rupees|pounds|dollars|lakh|crore|thousand)/i.test(w) && /\d/.test(w)) out.add(normaliseAmount(w));
  out.delete('');
  return { window: w, candidates: [...out] };
}

// Of overlapping matches naming one alias, a full form beats a partial, and
// among full forms the shortest wins: a value is the run itself, never the
// sentence around it. A partial is used only where no full match covers it.
export function minimalMatches(matches) {
  const full = matches.filter((m) => !m.partial);
  const kept = full.filter((m) => !full.some((o) => o !== m && o.alias === m.alias && o.start >= m.start && o.end <= m.end && (o.end - o.start) < (m.end - m.start)));
  const chosen = [];
  for (const m of kept.sort((a, b) => a.start - b.start || (a.end - a.start) - (b.end - b.start))) {
    if (chosen.some((c) => m.start < c.end && m.end > c.start)) continue;
    chosen.push(m);
  }
  for (const m of matches.filter((m) => m.partial).sort((a, b) => a.start - b.start || (a.end - a.start) - (b.end - b.start))) {
    if (chosen.some((c) => m.start < c.end && m.end > c.start)) continue;
    chosen.push(m);
  }
  return chosen.sort((a, b) => a.start - b.start);
}

export const DICTIONARY = {
  'health.condition': ['diabetes', 'type 2 diabetes', 't2d', 'hypertension', 'asthma', 'cancer', 'depression', 'anxiety', 'hiv', 'tuberculosis', 'tb', 'pcos', 'epilepsy', 'arrhythmia', 'angina', 'covid', 'covid-19', 'pregnancy', 'pregnant'],
  'health.medication': ['metformin', 'insulin', 'atorvastatin', 'sertraline', 'amlodipine', 'salbutamol', 'levothyroxine', 'ibuprofen', 'antidepressant', 'antidepressants', 'chemotherapy'],
  'health.result': ['biopsy', 'mri scan', 'ct scan', 'blood test result', 'hba1c', 'positive test', 'negative test', 'ecg', 'angiogram'],
  'legal.matter': ['divorce', 'divorce petition', 'bankruptcy', 'insolvency', 'custody', 'custody dispute', 'criminal charge', 'eviction', 'restraining order', 'arrest', 'conviction', 'litigation', 'lawsuit'],
};

export function dictionaryMatches(text, dictionary = DICTIONARY) {
  const out = [];
  for (const [type, terms] of Object.entries(dictionary)) {
    for (const term of [...terms].sort((a, b) => b.length - a.length)) {
      const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      let m;
      while ((m = re.exec(text))) {
        if (out.some((o) => m.index >= o.start && m.index < o.end)) continue;
        out.push({ start: m.index, end: m.index + m[0].length, text: m[0], cls: 'health-and-legal-matter', type, normalised: m[0].toLowerCase() });
      }
    }
  }
  return out;
}

// Every match of every identifier pattern, longest first, non-overlapping.
export function patternMatches(text, { partyShapes = [], party = null } = {}) {
  const out = [];
  const push = (start, end, cls, type, normalised) => {
    if (out.some((o) => start < o.end && end > o.start)) return;
    out.push({ start, end, text: text.slice(start, end), cls, type, normalised });
  };
  for (const shape of partyShapes) {
    const re = new RegExp(shape.source || shape, 'g');
    let m;
    while ((m = re.exec(text))) push(m.index, m.index + m[0].length, 'identity-number', party ? `reference.${party}` : 'reference', m[0].toUpperCase());
  }
  // A span more than one pattern of different classes claims is tokenised
  // under the first and marked ambiguous, for the user to confirm the type
  // in the device form before any step uses it.
  const claims = new Map();
  for (const p of PATTERNS) {
    p.re.lastIndex = 0;
    let m;
    while ((m = p.re.exec(text))) {
      if (p.check && !p.check(m[0])) continue;
      const key = `${m.index}:${m.index + m[0].length}`;
      if (!claims.has(key)) claims.set(key, []);
      claims.get(key).push({ start: m.index, end: m.index + m[0].length, p, text: m[0] });
    }
  }
  for (const list of [...claims.values()].sort((a, b) => a[0].start - b[0].start || (b[0].end - b[0].start) - (a[0].end - a[0].start))) {
    const first = list[0];
    const before = out.length;
    push(first.start, first.end, first.p.cls, first.p.type, first.p.normalise(first.text));
    if (out.length > before && list.length > 1) out[out.length - 1].ambiguous = list.map((c) => c.p.type);
  }
  // A party-issued reference: any run of six or more characters mixing
  // letters and digits (illustrative), where no other pattern claimed it.
  const ref = /\b(?=[A-Za-z0-9-]*[A-Za-z])(?=[A-Za-z0-9-]*[0-9])[A-Za-z0-9][A-Za-z0-9-]{5,}\b/g;
  let m;
  while ((m = ref.exec(text))) push(m.index, m.index + m[0].length, 'identity-number', party ? `reference.${party}` : 'reference', m[0].toUpperCase());
  return out.sort((a, b) => a.start - b.start);
}

// The partial forms of a value, masked as strictly as full ones: a last-four
// beside a card that names a person is enough to join them. A partial never
// outranks a full match on the same span.
export function partialForms(cls, type, value) {
  const v = String(value);
  const digits = v.replace(/\D/g, '');
  const out = new Set();
  switch (cls) {
    case 'identity-number':
    case 'payment-instrument':
      if (digits.length >= 4) out.add(digits.slice(-4));
      if (cls === 'payment-instrument' && digits.length >= 13) out.add(digits.slice(0, 6));
      if (type === 'aadhaar' && digits.length === 12) out.add(`XXXXXXXX${digits.slice(-4)}`);
      break;
    case 'personal-fact':
      if (type === 'name') for (const tok of v.toLowerCase().split(/\s+/)) if (tok.length > 2) out.add(tok);
      if (type === 'phone') out.add(digits.slice(-10));
      if (type === 'address') { const pc = /\b\d{6}\b|\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b/.exec(v); if (pc) out.add(pc[0]); }
      break;
    default:
      break;
  }
  out.delete('');
  return [...out];
}

// Every normalised form a value takes per its class: spaced, unspaced and
// hyphenated spellings, spoken digit by digit, case-folded, and the partial
// forms the maskers must cover.
export function normalisedForms(cls, type, value) {
  const v = String(value);
  const forms = new Set([v, v.toLowerCase()]);
  const digits = v.replace(/\D/g, '');
  const compact = v.replace(/[\s-]/g, '');
  forms.add(compact);
  forms.add(compact.toUpperCase());
  forms.add(compact.toLowerCase());
  switch (cls) {
    case 'identity-number':
    case 'payment-instrument':
      if (digits.length >= 4) {
        forms.add(digits);
        forms.add(digits.slice(-4));
        if (cls === 'payment-instrument' && digits.length >= 13) forms.add(digits.slice(0, 6));
        if (type === 'aadhaar' && digits.length === 12) forms.add(`XXXXXXXX${digits.slice(-4)}`);
        forms.add(digits.replace(/(.{4})/g, '$1 ').trim());
      }
      break;
    case 'personal-fact':
      if (type === 'date' || type === 'dob') for (const f of dateForms(v)) forms.add(f);
      if (type === 'phone') forms.add(digits);
      if (type === 'email') forms.add(v.toLowerCase());
      if (type === 'postcode') forms.add(compact.toUpperCase());
      break;
    case 'financial-fact':
      forms.add(normaliseAmount(v));
      break;
    case 'health-and-legal-matter':
      forms.add(v.toLowerCase());
      break;
    default:
      break;
  }
  for (const p of partialForms(cls, type, value)) forms.add(p);
  forms.delete('');
  return [...forms];
}
