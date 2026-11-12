/**
 * LendSwift Web Crypto AES-256-GCM Persistence Utility
 * Encrypts sensitive borrower data in LocalStorage under RBI guidelines.
 */

const SALT = new Uint8Array([76, 101, 110, 100, 83, 119, 105, 102, 116, 50, 48, 50, 54, 83, 97, 108]); // 'LendSwift2026Sal'
const PASSPHRASE = 'LendSwift-NBFC-Client-AES256-GCM-StorageKey';
const TTL_HOURS = 72; // 72-hour draft expiry

let cachedKey = null;

async function getEncryptionKey() {
  if (cachedKey) return cachedKey;

  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(PASSPHRASE),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  cachedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return cachedKey;
}

/**
 * Encrypts an object into an AES-256-GCM payload.
 * @param {Object} data - Form state to encrypt
 * @returns {Promise<string>} Base64/JSON string safe for localStorage
 */
export async function encryptData(data) {
  try {
    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for GCM

    const encodedData = encoder.encode(JSON.stringify(data));
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    const payload = {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encryptedBuffer)),
      timestamp: Date.now(),
    };

    return JSON.stringify(payload);
  } catch (err) {
    console.error('Encryption failed:', err);
    return null;
  }
}

/**
 * Decrypts an AES-256-GCM payload from localStorage.
 * Checks for 72-hour TTL expiration.
 * @param {string} rawPayload - JSON string from localStorage
 * @returns {Promise<{ data: Object|null, isExpired: boolean, error?: string }>}
 */
export async function decryptData(rawPayload) {
  if (!rawPayload) return { data: null, isExpired: false };

  try {
    const payload = JSON.parse(rawPayload);

    // Check 72-hour TTL expiration
    const ageHours = (Date.now() - payload.timestamp) / (1000 * 60 * 60);
    if (ageHours > TTL_HOURS) {
      return { data: null, isExpired: true, error: 'Draft has expired (72h limit).' };
    }

    const key = await getEncryptionKey();
    const iv = new Uint8Array(payload.iv);
    const ciphertext = new Uint8Array(payload.data);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    const parsedData = JSON.parse(decoder.decode(decryptedBuffer));

    return { data: parsedData, isExpired: false };
  } catch (err) {
    console.error('Decryption failed or data corrupted:', err);
    return { data: null, isExpired: false, error: 'Draft data corrupted or invalid.' };
  }
}