import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const pinLength = 6;
const derivedKeyLength = 64;

export function isValidPin(pin: string) {
  return new RegExp(`^\\d{${pinLength}}$`).test(pin);
}

export function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(pin, salt, derivedKeyLength).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPin(pin: string, storedHash: string) {
  const [salt, storedKey] = storedHash.split(":");

  if (!salt || !storedKey) return false;

  const derivedKey = scryptSync(pin, salt, derivedKeyLength);
  const expectedKey = Buffer.from(storedKey, "hex");

  return (
    expectedKey.length === derivedKey.length &&
    timingSafeEqual(expectedKey, derivedKey)
  );
}
