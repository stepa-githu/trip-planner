import { createHash, timingSafeEqual } from "crypto";

const COOKIE_NAME = "trip_admin_session";

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function verifyAdminPassword(password: string) {
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    throw new Error("ADMIN_PASSWORD non configurata.");
  }

  const providedHash = Buffer.from(hashValue(password));
  const expectedHash = Buffer.from(hashValue(expectedPassword));

  return timingSafeEqual(providedHash, expectedHash);
}

export function createAdminSessionValue() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET non configurato.");
  }

  return hashValue(secret);
}

export function verifyAdminSessionValue(value?: string) {
  if (!value) {
    return false;
  }

  const expected = createAdminSessionValue();

  const providedBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}