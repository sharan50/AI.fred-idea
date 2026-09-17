// Ed25519 over canonical JSON, with node:crypto and nothing else. The task
// service signs step contexts, approval tokens and version stamps under one
// key per market region; the substitutor holds the public keys, the current
// and the previous, in its signed build configuration.
import { generateKeyPairSync, sign as cryptoSign, verify as cryptoVerify, createHash, randomBytes } from 'node:crypto';
import { canonical } from './validate.mjs';

export function keyPair(keyId) {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  return { key_id: keyId, publicKey, privateKey };
}

export function signRecord(privateKey, record) {
  const { signature, ...rest } = record;
  return cryptoSign(null, Buffer.from(canonical(rest)), privateKey).toString('base64');
}

export function verifyRecord(publicKey, record) {
  if (!record || typeof record.signature !== 'string') return false;
  const { signature, ...rest } = record;
  try {
    return cryptoVerify(null, Buffer.from(canonical(rest)), publicKey, Buffer.from(signature, 'base64'));
  } catch {
    return false;
  }
}

export function sha256(value) {
  return createHash('sha256').update(typeof value === 'string' ? value : canonical(value)).digest('hex');
}

export function nonce() {
  return randomBytes(16).toString('hex');
}

// The substitutor's view: public keys only, the current and the previous,
// rotated on a schedule and on any suspicion with a two-key overlap.
export class KeyRing {
  constructor(current, previous = null) {
    this.current = current;
    this.previous = previous;
  }

  rotate(next) {
    this.previous = this.current;
    this.current = next;
  }

  publicKeyFor(keyId) {
    if (this.current && this.current.key_id === keyId) return this.current.publicKey;
    if (this.previous && this.previous.key_id === keyId) return this.previous.publicKey;
    return null;
  }

  verify(record) {
    const pub = this.publicKeyFor(record && record.key_id);
    if (!pub) return false;
    return verifyRecord(pub, record);
  }
}

// A bound device: its key never leaves it and signs only after the device's
// own lock-screen factor, so possession alone signs nothing.
export class Device {
  constructor(deviceId) {
    this.device_id = deviceId;
    const { publicKey, privateKey } = generateKeyPairSync('ed25519');
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.suspended = false;
  }

  sign(record, { unlocked = true } = {}) {
    if (!unlocked) throw new Error('the device signs only after its own unlock factor');
    if (this.suspended) throw new Error('a suspended device signs nothing');
    return signRecord(this.privateKey, record);
  }

  verify(record) {
    return verifyRecord(this.publicKey, record);
  }
}
