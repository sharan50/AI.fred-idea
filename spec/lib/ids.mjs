// Deterministic identifiers for the reference implementations: one counter
// per prefix, so a run reproduces and a test can name what it expects.
export class Ids {
  constructor() {
    this.counters = new Map();
  }

  next(prefix, width = 4) {
    const n = (this.counters.get(prefix) || 0) + 1;
    this.counters.set(prefix, n);
    return `${prefix}_${String(n).padStart(width, '0')}`;
  }
}
